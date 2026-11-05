# 📊 Excel Import Sistemi - Quiz Questions

## 🚀 Excel Import API Endpoints

### 1. **Template İndirme**
```
GET /api/tenants/{tenantId}/quiz-questions/excel-template
```
- Örnek verilerle dolu Excel template dosyası indirir
- Kolon başlıkları ve format bilgilerini içerir

### 2. **Excel Doğrulama**
```
POST /api/tenants/{tenantId}/quiz-questions/validate-excel
Content-Type: multipart/form-data
Field: excelFile
```
- Excel dosyasının formatını kontrol eder
- Hata varsa detaylı rapor döner
- Preview için ilk 3 satırı gösterir

### 3. **Excel Import**
```
POST /api/tenants/{tenantId}/quiz-questions/bulk-import
Content-Type: multipart/form-data
Field: excelFile
```
- Excel dosyasından soruları toplu import eder
- Başarılı/başarısız sonuçları rapor eder

## 📋 Excel Dosya Formatı

### **Kolon Başlıkları (Türkçe):**
| Kolon | Açıklama | Zorunlu | Örnek |
|-------|----------|---------|-------|
| `Başlık` | Soru başlığı | ❌ | "JavaScript Değişkenler" |
| `Soru` | Soru metni | ✅ | "JavaScript'te let ve var farkı nedir?" |
| `Açıklama` | Soru açıklaması | ❌ | "Temel JavaScript kavramları" |
| `Şık A` | A şıkkı | ✅ | "Fark yoktur" |
| `Şık B` | B şıkkı | ✅ | "let block-scoped" |
| `Şık C` | C şıkkı | ❌ | "var daha hızlı" |
| `Şık D` | D şıkkı | ❌ | "Syntax farkı var" |
| `Şık E` | E şıkkı | ❌ | "Ek seçenek" |
| `Doğru Cevap` | Doğru şık | ✅ | "B" |
| `Zorluk` | Zorluk seviyesi | ❌ | "easy/medium/hard" |
| `Puan` | Soru puanı | ❌ | 15 |
| `Süre` | Zaman limiti (saniye) | ❌ | 60 |
| `Etiketler` | Tag'ler (virgül ayırmalı) | ❌ | "javascript,variables" |
| `Açıklama Text` | Doğru cevap açıklaması | ❌ | "let block scope'a sahiptir" |

### **Kolon Başlıkları (İngilizce):**
| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| `Title` | Question title | ❌ | "JavaScript Variables" |
| `Question` | Question text | ✅ | "What is the difference between let and var?" |
| `Description` | Question description | ❌ | "Basic JavaScript concepts" |
| `Option A` | Option A | ✅ | "No difference" |
| `Option B` | Option B | ✅ | "let is block-scoped" |
| `Option C` | Option C | ❌ | "var is faster" |
| `Option D` | Option D | ❌ | "Syntax difference" |
| `Option E` | Option E | ❌ | "Additional option" |
| `Correct Answer` | Correct option | ✅ | "B" |
| `Difficulty` | Difficulty level | ❌ | "easy/medium/hard" |
| `Points` | Question points | ❌ | 15 |
| `Time Limit` | Time limit (seconds) | ❌ | 60 |
| `Tags` | Tags (comma separated) | ❌ | "javascript,variables" |
| `Explanation` | Correct answer explanation | ❌ | "let has block scope" |

## 📁 Dosya Gereksinimleri

- **Format:** `.xlsx` veya `.xls`
- **Maksimum Boyut:** 5MB
- **Minimum Şık Sayısı:** 2 (A ve B şıkları zorunlu)
- **Maksimum Şık Sayısı:** 5 (A'dan E'ye kadar)

## 💻 Frontend Kullanımı

### **React Component Örneği:**

```typescript
const ExcelImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState(null);
  const [importing, setImporting] = useState(false);

  // Template indirme
  const downloadTemplate = async () => {
    const response = await fetch(`/api/tenants/${tenantId}/quiz-questions/excel-template`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-questions-template.xlsx';
    a.click();
  };

  // Dosya seçimi
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationResult(null);
    }
  };

  // Dosya doğrulama
  const validateFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch(`/api/tenants/${tenantId}/quiz-questions/validate-excel`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  // Import işlemi
  const importFile = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch(`/api/tenants/${tenantId}/quiz-questions/bulk-import`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${result.data.successful.length} soru başarıyla eklendi!`);
        if (result.data.failed.length > 0) {
          console.log('Başarısız sorular:', result.data.failed);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="excel-import">
      <button onClick={downloadTemplate}>
        📥 Excel Template İndir
      </button>
      
      <input 
        type="file" 
        accept=".xlsx,.xls" 
        onChange={handleFileSelect}
      />
      
      {file && (
        <button onClick={validateFile}>
          ✅ Dosyayı Doğrula
        </button>
      )}
      
      {validationResult?.success && (
        <div>
          <p>✅ {validationResult.message}</p>
          <button onClick={importFile} disabled={importing}>
            {importing ? '📤 İçe aktarılıyor...' : '📤 Soruları İçe Aktar'}
          </button>
        </div>
      )}
    </div>
  );
};
```

## 📋 Excel Template Örneği

| Başlık | Soru | Şık A | Şık B | Şık C | Şık D | Doğru Cevap | Zorluk | Puan |
|--------|------|-------|-------|-------|-------|-------------|--------|------|
| JS Değişkenler | let ve var farkı nedir? | Fark yok | let block-scoped | var daha hızlı | Syntax farkı | B | medium | 15 |
| React Components | Functional component nasıl oluşturulur? | class extends | function Component() | createComponent() | React.component() | B | easy | 10 |

## 🔄 Import Süreci

1. **Template İndir** → Excel dosyasını doldur
2. **Dosya Yükle** → Validate et  
3. **Preview Kontrol** → Verileri kontrol et
4. **Import Et** → Soruları sisteme aktar
5. **Rapor Al** → Başarılı/başarısız sonuçları gör

Bu sistem ile Excel'den binlerce soruyu kolayca sisteme aktarabilirsiniz! 🚀