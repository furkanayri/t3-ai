# 🚀 Video Batch Processing - Komple Rehber

Sıfırdan başlayıp bitiş yapana kadar tek dokümanda her şey.

## 📊 Sistem Özeti

- **Ne İşe Yarar:** 5,000-20,000 mülakat videosu otomatik transkript + AI değerlendirme
- **Teknoloji:** Whisper (transkript) + Gemma 2 9B (değerlendirme)
- **Altyapı:** 5× AWS EC2 g5.xlarge (24GB GPU her biri)
- **Süre:** ~45-60 saat (15,000 video için)
- **Maliyet:** ~$250

---

## ⚙️ Gereksinimler

### Bilgisayarında Olması Gerekenler:
- [x] Node.js 18+
- [x] Docker Desktop
- [x] AWS CLI
- [x] Git

### AWS'de Olması Gerekenler:
- [x] AWS hesabı
- [x] AWS CLI yapılandırılmış (`aws configure`)
- [x] Billing aktif

---

## 🎯 ADIM ADIM KURULUM

### ADIM 1: Repository Hazırla (2 dakika)

```bash
# 1. Proje klasörüne git
cd /path/to/topludegerlendirme

# 2. Node.js dependencies kur
npm install

# 3. Environment variables kopyala
cp env.example .env

# 4. .env dosyasını düzenle (YOUR_ACCOUNT_ID'yi AWS hesap numaranla değiştir)
nano .env
```

**Not:** AWS Account ID'ni bul:
```bash
aws sts get-caller-identity --query Account --output text
```

---

### ADIM 2: IAM Role Oluştur (OPSİYONEL - ATLA)

**⚠️ NOT:** AWS Credentials kullanacağın için IAM role **gerekmez**. Bu adımı **ATLA** ve direkt ADIM 3'e geç!

**Sadece IAM role kullanmak istersen (credentials yerine):**

```bash
# Trust policy oluştur
cat > ec2-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# IAM Role oluştur
aws iam create-role \
  --role-name VideoWorkerRole \
  --assume-role-policy-document file://ec2-trust-policy.json

# ECR policy ekle
aws iam attach-role-policy \
  --role-name VideoWorkerRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# SQS policy ekle
aws iam attach-role-policy \
  --role-name VideoWorkerRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess

# CloudWatch policy ekle (opsiyonel - loglama için)
aws iam attach-role-policy \
  --role-name VideoWorkerRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# Instance Profile oluştur
aws iam create-instance-profile \
  --instance-profile-name VideoWorkerInstanceProfile

# Role'u profile'a ekle
aws iam add-role-to-instance-profile \
  --instance-profile-name VideoWorkerInstanceProfile \
  --role-name VideoWorkerRole

# IAM propagation için bekle
echo "⏳ IAM propagation için 10 saniye bekleniyor..."
sleep 10

echo "✅ IAM Role hazır: VideoWorkerRole"
echo "✅ Instance Profile: VideoWorkerInstanceProfile"

# Temp dosyayı temizle
rm ec2-trust-policy.json
```

---

### ADIM 3: SQS Kuyruğu Oluştur (2 dakika)

```bash
# Ana kuyruk
aws sqs create-queue \
  --queue-name VideoJobQueue \
  --attributes '{
    "VisibilityTimeout": "900",
    "MessageRetentionPeriod": "345600",
    "ReceiveMessageWaitTimeSeconds": "20"
  }' \
  --region eu-west-1

# Dead Letter Queue (hatalı işler için)
aws sqs create-queue \
  --queue-name VideoJobQueue_DLQ \
  --region eu-west-1

# DLQ'yu ana kuyruğa bağla
export DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name VideoJobQueue_DLQ --query QueueUrl --output text) \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

export SQS_URL=$(aws sqs get-queue-url --queue-name VideoJobQueue --query QueueUrl --output text)

aws sqs set-queue-attributes \
  --queue-url $SQS_URL \
  --attributes "{
    \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"
  }"
```

**SQS URL'ini not al:**
```bash
echo $SQS_URL
# Çıktı: https://sqs.eu-west-1.amazonaws.com/<AWS_ACCOUNT_ID>/VideoJobQueue
```

---

### ADIM 4: ECR Repository Oluştur (30 saniye)

```bash
aws ecr create-repository \
  --repository-name video-worker-repo \
  --image-scanning-configuration scanOnPush=true \
  --region eu-west-1
```

**Repository URI'yi not al:**
```bash
aws ecr describe-repositories \
  --repository-names video-worker-repo \
  --query 'repositories[0].repositoryUri' \
  --output text \
  --region eu-west-1
# Çıktı: 921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo
```

---

### ADIM 5: Docker Image Build & Push (15-20 dakika)

#### Yöntem A: Cross-Platform Build (ÖNERİLEN - Mac M2 İçin Şart)

```bash
echo "🔐 ECR'a login yapılıyor..."
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 921658941149.dkr.ecr.eu-west-1.amazonaws.com

echo "🚀 Cross-platform build yapılıyor (15-20 dakika)..."

# Mac M2, Windows, her platformda çalışır
# --platform linux/amd64 ŞART! (AWS EC2 x86_64 kullanır)
docker buildx build \
  --platform linux/amd64 \
  --tag 921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo:latest \
  --push \
  .

echo "✅ Image pushed!"

# Platform kontrolü
docker buildx imagetools inspect 921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo:latest | grep Platform
```

**⚠️ Buildx yoksa önce setup yap:**
```bash
docker buildx create --name multiplatform --driver docker-container --use
docker buildx inspect multiplatform --bootstrap
```

#### Yöntem B: Normal Build (Sadece Linux/Windows x86_64 İçin)

```bash
# 1. ECR'a login
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 921658941149.dkr.ecr.eu-west-1.amazonaws.com

# 2. Build
docker build -t video-worker-repo .

# 3. Tag
docker tag video-worker-repo:latest 921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo:latest

# 4. Push
docker push 921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo:latest
```

**⚠️ Mac M2'de Yöntem B KULLANMA! EC2'de "exec format error" alırsın.**

**⏱️ İlk build 15-20 dakika sürer (PyTorch image büyük + dependencies)**

**✅ Build başarılı mı kontrol et:**
```bash
# Image ECR'da mı?
aws ecr list-images --repository-name video-worker-repo --region eu-west-1

# Çıktı:
{
    "imageIds": [
        {
            "imageDigest": "sha256:...",
            "imageTag": "latest"
        }
    ]
}
```

---

### ADIM 6: Security Group Hazırla (1 dakika)

#### Seçenek A: Var Olan SG'yi Kullan (Kolay)

Eğer zaten bir Security Group oluşturmuşsan:

```bash
# SG ID'yi export et
export SG_ID="sg-01b0b3dd70e69b949"

# Kontrol et
echo "Security Group ID: $SG_ID"
```

#### Seçenek B: Yeni SG Oluştur

```bash
# Default VPC ID al
export VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=is-default,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region eu-west-1)

# Security group oluştur
export SG_ID=$(aws ec2 create-security-group \
  --group-name VideoWorkerSecurityGroup \
  --description "Security group for video workers" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text \
  --region eu-west-1)

# SSH erişimi ekle (sadece senin IP'nden)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr $(curl -s https://checkip.amazonaws.com)/32 \
  --region eu-west-1

echo "Security Group ID: $SG_ID"
```

---

### ADIM 7: Launch Template Oluştur (5 dakika)

#### A. Environment Variables Hazırla

```bash
# AMI ID (Deep Learning AMI bul)
export AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=Deep Learning OSS Nvidia Driver AMI GPU PyTorch 2.* (Ubuntu 22.04)*" \
          "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text \
  --region eu-west-1)

# VEYA Manuel (önceki adımda bulduğun AMI)
# export AMI_ID="ami-008b1657cfa2bf435"

# Security Group ID (ADIM 6'dan)
export SG_ID="sg-01b0b3dd70e69b949"

# AWS Account ID
export AWS_ACCOUNT_ID="921658941149"

# SSH Key Pair Name
export KEY_NAME="mac_key"

# Kontrol et
echo "AMI ID: $AMI_ID"
echo "SG ID: $SG_ID"
echo "Key Name: $KEY_NAME"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
```

#### B. User Data Script Oluştur

```bash
# AWS Account ID
export AWS_ACCOUNT_ID="921658941149"

# User Data script oluştur
cat > user-data.sh <<EOF
#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== Starting at \$(date) ==="

# AWS Credentials (use a secret manager; never commit real values)
export AWS_ACCESS_KEY_ID="<YOUR_AWS_ACCESS_KEY_ID>"
export AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET_ACCESS_KEY>"
export AWS_DEFAULT_REGION="eu-west-1"

# Docker başlat
systemctl start docker
systemctl enable docker
sleep 5

# ECR login (credentials env'den okunur)
aws ecr get-login-password --region eu-west-1 | \\
  docker login --username AWS --password-stdin \\
  921658941149.dkr.ecr.eu-west-1.amazonaws.com

# Container başlat
docker run -d \\
  --name video-worker \\
  --restart always \\
  --gpus all \\
  -e MONGO_URI="<YOUR_MONGO_URI>" \\
  -e SQS_URL="https://sqs.eu-west-1.amazonaws.com/<AWS_ACCOUNT_ID>/VideoJobQueue" \\
  -e AWS_REGION="eu-west-1" \\
  -e AWS_ACCESS_KEY_ID="<YOUR_AWS_ACCESS_KEY_ID>" \\
  -e AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET_ACCESS_KEY>" \\
  -e R2_BUCKET_URL="https://t3burs.org" \\
  921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo:latest

# Logs
docker logs -f video-worker > /var/log/worker.log 2>&1 &

echo "=== Completed at \$(date) ==="
EOF
```

#### C. Launch Template Oluştur

```bash
# User data'yı base64'e çevir
export USER_DATA_BASE64=$(base64 -i user-data.sh)

# Launch Template oluştur
aws ec2 create-launch-template \
  --launch-template-name VideoWorkerTemplate \
  --version-description "Video processing worker v1.0" \
  --region eu-west-1 \
  --launch-template-data "{
    \"ImageId\": \"$AMI_ID\",
    \"InstanceType\": \"g5.xlarge\",
    \"KeyName\": \"mac_key\",
    \"SecurityGroupIds\": [\"$SG_ID\"],
    \"BlockDeviceMappings\": [{
      \"DeviceName\": \"/dev/sda1\",
      \"Ebs\": {
        \"VolumeSize\": 80,
        \"VolumeType\": \"gp3\",
        \"Iops\": 3000,
        \"Throughput\": 125,
        \"DeleteOnTermination\": true,
        \"Encrypted\": true
      }
    }],
    \"UserData\": \"$USER_DATA_BASE64\"
  }"
```

**✅ Template hazır!**

---

### ADIM 8: İşleri SQS'e Push Et (5-10 dakika)

```bash
# Environment variables ayarla
export MONGO_URI="<YOUR_MONGO_URI>"
export SQS_URL="https://sqs.eu-west-1.amazonaws.com/<AWS_ACCOUNT_ID>/VideoJobQueue"
export AWS_REGION="eu-west-1"

# Push jobs
node push_jobs.js
```

**Beklenen Çıktı:**
```
🚀 Starting job pusher...
✅ Connected to MongoDB
✅ Loaded 7 interview question sets
📤 Pushed: 15420 jobs
✅ Job pushing completed!
   Total jobs pushed: 15420
   Processed candidates: 3850
   Skipped candidates (empty answers): 142
```

**✅ SQS'i kontrol et:**
```bash
aws sqs get-queue-attributes \
  --queue-url $SQS_URL \
  --attribute-names ApproximateNumberOfMessages
```

---

### ADIM 9: EC2 Instances Başlat (5 dakika)

```bash
# 5 instance başlat
aws ec2 run-instances \
  --launch-template LaunchTemplateName=VideoWorkerTemplate \
  --count 5 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=VideoWorker},{Key=Project,Value=InterviewProcessing}]' \
  --region eu-west-1
```

**Instance ID'leri kaydet:**
```bash
export INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=VideoWorker" "Name=instance-state-name,Values=running,pending" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text \
  --region eu-west-1)

echo "Launched instances: $INSTANCE_IDS"
```

**⏱️ Instance'lar 5-10 dakikada hazır olur (AMI büyük)**

---

### ADIM 10: İzleme (Sürekli)

#### Terminal 1: SQS Monitoring

```bash
watch -n 60 "aws sqs get-queue-attributes \
  --queue-url $SQS_URL \
  --attribute-names ApproximateNumberOfMessages,ApproximateNumberOfMessagesNotVisible \
  --query 'Attributes' \
  --region eu-west-1"
```

#### Terminal 2: MongoDB Monitoring

```bash
mongosh "<YOUR_MONGO_URI>"

# Mongo shell içinde
use HEPLIN-IK-PRODUCT

while (true) {
  print("\n=== " + new Date() + " ===");
  print("SUCCESS: " + db.processed_interviews.countDocuments({status: "SUCCESS"}));
  print("FAILED: " + db.processed_interviews.countDocuments({status: "FAILED"}));
  print("TOTAL: " + db.processed_interviews.countDocuments());
  sleep(30000);
}
```

#### Terminal 3: Worker Logs (Opsiyonel)

```bash
# Bir instance'a SSH
INSTANCE_IP=$(aws ec2 describe-instances \
  --instance-ids $(echo $INSTANCE_IDS | awk '{print $1}') \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region eu-west-1)

ssh -i your-key.pem ubuntu@$INSTANCE_IP

# Container logları
docker logs -f video-worker
```

#### Hızlı Status Check

```bash
# SQS'te kalan iş sayısı
aws sqs get-queue-attributes \
  --queue-url $SQS_URL \
  --attribute-names ApproximateNumberOfMessages \
  --query 'Attributes.ApproximateNumberOfMessages' \
  --output text \
  --region eu-west-1

# MongoDB'de işlenen sayı
mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments()" --quiet
```

---

### ADIM 11: Bekleme

**Beklenen Süre:** 45-60 saat (15,000 video için)

**İlerleme Hesaplama:**
```bash
# Toplam iş
TOTAL_JOBS=15420

# İşlenen
COMPLETED=$(mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments()" --quiet)

# Kalan
REMAINING=$(aws sqs get-queue-attributes \
  --queue-url $SQS_URL \
  --attribute-names ApproximateNumberOfMessages \
  --query 'Attributes.ApproximateNumberOfMessages' \
  --output text \
  --region eu-west-1)

# Yüzde
PERCENT=$((COMPLETED * 100 / TOTAL_JOBS))

echo "İlerleme: $PERCENT% ($COMPLETED / $TOTAL_JOBS)"
echo "Kalan SQS: $REMAINING"
```

---

### ADIM 12: İşler Bitince Cleanup

#### A. Instance'ları Durdur

```bash
aws ec2 terminate-instances --instance-ids $INSTANCE_IDS --region eu-west-1
```

#### B. Sonuçları Doğrula

```bash
export MONGO_URI="<YOUR_MONGO_URI>"

# MongoDB'de toplam kayıt
mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments()" --quiet

# Başarılı
mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments({status: 'SUCCESS'})" --quiet

# Başarısız
mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments({status: 'FAILED'})" --quiet

# Ses olmayan
mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments({'diagnostics.hasAudio': false})" --quiet
```

#### C. AWS Kaynaklarını Temizle (Opsiyonel)

```bash
# IAM Role temizle
echo "🧹 IAM Role temizleniyor..."

# Policy'leri kaldır
aws iam detach-role-policy \
  --role-name VideoWorkerRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

aws iam detach-role-policy \
  --role-name VideoWorkerRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess

aws iam detach-role-policy \
  --role-name VideoWorkerRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# Role'u profile'dan kaldır
aws iam remove-role-from-instance-profile \
  --instance-profile-name VideoWorkerInstanceProfile \
  --role-name VideoWorkerRole

# Instance profile sil
aws iam delete-instance-profile \
  --instance-profile-name VideoWorkerInstanceProfile

# Role sil
aws iam delete-role \
  --role-name VideoWorkerRole

echo "✅ IAM Role silindi"

# SQS sil
echo "🧹 SQS kuyrukları siliniyor..."
aws sqs delete-queue --queue-url $SQS_URL --region eu-west-1
aws sqs delete-queue --queue-url $(aws sqs get-queue-url --queue-name VideoJobQueue_DLQ --query QueueUrl --output text --region eu-west-1) --region eu-west-1

# ECR sil
echo "🧹 ECR repository siliniyor..."
aws ecr batch-delete-image \
  --repository-name video-worker-repo \
  --image-ids imageTag=latest \
  --region eu-west-1

aws ecr delete-repository \
  --repository-name video-worker-repo \
  --force \
  --region eu-west-1

# Security Group sil
echo "🧹 Security Group siliniyor..."
aws ec2 delete-security-group --group-id $SG_ID --region eu-west-1

# Launch Template sil
echo "🧹 Launch Template siliniyor..."
aws ec2 delete-launch-template --launch-template-name VideoWorkerTemplate --region eu-west-1

echo "✅ Tüm AWS kaynakları temizlendi"
```

---

## 📊 Sonuç Yapısı

Her işlenmiş video için MongoDB'de:

```json
{
  "fileKey": "uuid-questionId.webm",
  "candidateId": ObjectId("..."),
  "userId": ObjectId("..."),
  "interviewId": ObjectId("..."),
  "questionId": "69176f44222b9be3d62bcbf5",
  "question": "Soru metni...",
  "evaluationCriteria": "5-Çok İyi\t...\n4-İyi\t...",
  "transcript": "Aday cevabı transkript...",
  "evaluationScore": 7.5,
  "evaluationReasoning": "Aday konuyu iyi kavramış...",
  "diagnostics": {
    "hasAudio": true,
    "audioDetectionMethod": "ffmpeg_volume_detect",
    "averageVolumeDb": -28.3,
    "videoDurationSeconds": 142,
    "processingTimeSeconds": 38.2,
    "errors": []
  },
  "status": "SUCCESS",
  "processedAt": ISODate("2025-11-26T...")
}
```

---

## ⚠️ Sorun Giderme

### Problem: Docker build "exec format error"

**Neden:** ARM64 image x86_64 EC2'de çalışmaya çalışıyor.

**Çözüm:** `build-and-push.sh` script zaten `--platform linux/amd64` kullanıyor. Manuel build ediyorsan:
```bash
docker buildx build --platform linux/amd64 --tag ... --push .
```

### Problem: Instance başlamıyor

**Kontrol:**
```bash
# Instance status
aws ec2 describe-instance-status --instance-ids $INSTANCE_IDS --region eu-west-1

# SSH ile bağlan ve log kontrol et
ssh ubuntu@instance-ip
tail -f /var/log/user-data.log
```

### Problem: SQS mesajları azalmıyor

**Kontrol:**
```bash
# Worker logları
ssh ubuntu@instance-ip
docker logs video-worker

# Container çalışıyor mu?
docker ps
```

### Problem: MongoDB'ye yazılmıyor

**Kontrol:**
- MongoDB URI doğru mu?
- Network erişimi var mı?
- Worker loglarında hata var mı?

---

## 💰 Maliyet Kontrolü

```bash
# Son 7 gün maliyet
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics UnblendedCost \
  --group-by Type=SERVICE \
  --region us-east-1
```

**Beklenen:** ~$250 (15,000 video için)

---

## 📝 Hızlı Komutlar Özeti

```bash
# Environment variables (her shell'de çalıştır - kopyala yapıştır)
export AWS_ACCOUNT_ID="921658941149"
export AWS_REGION="eu-west-1"
export AWS_ACCESS_KEY_ID="<YOUR_AWS_ACCESS_KEY_ID>"
export AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET_ACCESS_KEY>"
export SG_ID="sg-01b0b3dd70e69b949"
export AMI_ID="ami-008b1657cfa2bf435"
export KEY_NAME="mac_key"
export ECR_URI="921658941149.dkr.ecr.eu-west-1.amazonaws.com/video-worker-repo"
export MONGO_URI="<YOUR_MONGO_URI>"
export SQS_URL="https://sqs.eu-west-1.amazonaws.com/<AWS_ACCOUNT_ID>/VideoJobQueue"

# Instance ID'leri al (launch'tan sonra)
export INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=VideoWorker" "Name=instance-state-name,Values=running" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text \
  --region eu-west-1)

# Security Group ID'yi al (oluşturduktan sonra)
export SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=VideoWorkerSecurityGroup" \
  --query "SecurityGroups[0].GroupId" \
  --output text \
  --region eu-west-1)
```

**Status Check (hızlı):**
```bash
# SQS'te kalan
aws sqs get-queue-attributes --queue-url $SQS_URL --attribute-names ApproximateNumberOfMessages --query 'Attributes.ApproximateNumberOfMessages' --output text --region eu-west-1

# MongoDB'de işlenen
mongosh "$MONGO_URI" --eval "db.processed_interviews.countDocuments()" --quiet
```

---

## ✅ Checklist

Deployment öncesi:
- [ ] AWS CLI yapılandırılmış (`aws configure`)
- [ ] Node.js dependencies kurulu (`npm install`)
- [ ] `.env` dosyası düzenlenmiş
- [ ] Scriptler executable (`chmod +x *.sh`)

Deployment sırası:
- [ ] IAM Role oluşturuldu
- [ ] SQS kuyruğu oluşturuldu
- [ ] ECR repository oluşturuldu
- [ ] Docker image build ve push edildi
- [ ] Security Group oluşturuldu
- [ ] Launch Template oluşturuldu
- [ ] İşler SQS'e push edildi
- [ ] EC2 instances başlatıldı

İzleme:
- [ ] SQS mesaj sayısı azalıyor
- [ ] MongoDB'de kayıt artıyor
- [ ] Worker logları normal

Cleanup:
- [ ] Instance'lar terminate edildi
- [ ] Sonuçlar doğrulandı
- [ ] AWS kaynakları temizlendi

---

## 🎯 Özet

1. **Setup:** 30 dakika
2. **İş Push:** 5 dakika
3. **İşleme:** 45-60 saat
4. **Cleanup:** 5 dakika
5. **Maliyet:** ~$250

**Toplam:** ~48-60 saat + $250 ile 15,000 video işlenmiş olacak! 🚀

