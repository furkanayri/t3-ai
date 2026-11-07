import { deleteUserState, getUserState, saveUserState, whatsappMessage, whatsappTakeImage } from "@/utils/whatsapp/sendFlow";
import jsontoAutoFill from "../upload/jsonToAutoFill";
import { Types } from "mongoose";
import { uuid } from 'uuidv4';
import { applyjowWithWhatsapp } from "./whatsappUtils";
export default async function sendwhatsappWebhook(ctx: Context) {
  const body_param = ctx.request.body;
  if (!body_param) {
    console.log("webhook status check");
    ctx.body = "webhook request";
    return;
  }

  const entry = body_param.entry?.[0]?.changes?.[0]?.value;
  const phoneMetadata = entry?.metadata;
  const status = entry?.status;
  const message = entry?.messages?.[0];

  const mediaType = message?.type;
  const mediaId = message?.document?.id;

  if (!entry && !phoneMetadata && !message) {
    console.error("Invalid structure in webhook body");
    ctx.body = "Invalid webhook structure";
    return;
  }

  const phon_no_id = phoneMetadata.phone_number_id;
  const from = message.from;
  const msg_body = message.text?.body;

  if (!from) {
    console.error("Invalid phone number in webhook body");
    ctx.body = "phone number not found";
    return;
  }
  const checkUser = await ctx.service("users").findOne({
    phone: from,
  });

  console.log(checkUser, 'checkUser');

  if (mediaType === 'text') {
    const regex = /ID:([a-zA-Z0-9]+)/;
    const match = msg_body.match(regex);
    if (match) {
      console.log('çalıştım1');

      const jobId = match[1];
      try {
        const job = await ctx.service("jobs").findById(jobId);
        await saveUserState(from, { jobId: jobId });
      } catch (error) {
        const errorMessage = `Üzgünüz, belirttiğiniz iş ilanı sistemimizde bulunamadı. 
        Yeni iş fırsatlarını keşfetmek için lütfen şu bağlantıyı kullanın: 
        👉 https://jobs.heplin.com/tr`;

        await whatsappMessage(from, phon_no_id, errorMessage);

        ctx.body = errorMessage;
      }
    }
  }

  if (msg_body === '/bilgi' && checkUser && checkUser.whatsappStatus === "registered") {
    console.log('çalıştım2222222222222222');
    try {
      const jobApplications = await ctx.service('jobApplications').findAll({ userId: checkUser._id });

      let allMessages = [];  // Tüm mesajları depolayacağımız bir array oluşturuyoruz.

      for (const jobApplication of jobApplications.results) {
        const job = await ctx.service('jobs').findOne({ _id: jobApplication.jobId });

        let message = '';

        if (jobApplication && jobApplication.viewedBy && jobApplication.viewedBy.length > 0) {
          const isSeen = jobApplication.viewedBy.find(view => view.isSeen === true);
          console.log(jobApplication.currentRecruitmentStepId, 'jobApplications.currentRecruitmentStepId');

          message = isSeen
            ? `${job.title} Başvurunuz ilgili personel tarafından görüntülenmiştir.`
            : `Başvurunuz inceleniyor. ${job.title} başvurunuz hakkında ekstra bir bilgi bulunmamaktadır.`;
        } else {
          message = `Başvurunuz inceleniyor. ${job.title} başvurunuz hakkında ekstra bir bilgi bulunmamaktadır.`;
        }

        allMessages.push(message);  // Her bir başvuru durumu için mesajı ekliyoruz.
      }

      if (allMessages.length > 0) {
        // Tüm başvuru durumlarını birleştiriyoruz ve tek bir mesaj olarak gönderiyoruz.
        const combinedMessage = allMessages.join('\n\n');
        await whatsappMessage(from, phon_no_id, combinedMessage);
        ctx.body = combinedMessage;
      } else {
        const noApplicationsMessage = `Henüz başvurunuz bulunmamaktadır.`;
        await whatsappMessage(from, phon_no_id, noApplicationsMessage);
        ctx.body = noApplicationsMessage;
      }

    } catch (error) {
      console.error('Başvuru sonuçları alınırken hata oluştu: ', error);

      const message = `Başvuru sonuçlarınızı incelereken bir sorun ile karşılaştım. Lütfen daha sonra tekrar deneyin.`;
      await whatsappMessage(from, phon_no_id, message);

      ctx.throw(500, message);
    }
  }





  if (!checkUser) {
    console.log('çalıştım333');

    const userState = await getUserState(from);
    if (
      msg_body.toLowerCase() !== "evet" &&
      msg_body.toLowerCase() !== "hayır"
    ) {
      const createUserMessage = `Merhaba! Sistemimizde kayıtlı değilsiniz. İş başvurunuzu tamamlamak için kayıt olmanız gerekmektedir. Kayıt olmak ister misiniz? Lütfen "Evet" veya "Hayır" olarak yanıt verin.`;
      await whatsappMessage(from, phon_no_id, createUserMessage);
      ctx.body = `Merhaba! Sistemimizde kayıtlı değilsiniz. İş başvurunuzu tamamlamak için kayıt olmanız gerekmektedir. Kayıt olmak ister misiniz? Lütfen "Evet" veya "Hayır" olarak yanıt verin.`;
      return;
    }

    if (msg_body.toLowerCase() === "evet") {
      await ctx.service("users").create({
        phone: from,
        whatsappStatus: "awaiting_user_info",
        email: `${uuid()}@heplin.com`
      });
      const sendRegisterMessage = `Kayıt işlemini başlatıyoruz. Lütfen Adınızı Yazınız.`;
      userState.step = 1;

      await saveUserState(from, userState);
      console.log(userState, 'userStat1111111e');

      await whatsappMessage(from, phon_no_id, sendRegisterMessage);
      ctx.body = "adınız Gönder";
      return;
    }
    if (msg_body.toLowerCase() === "hayır") {
      const sendnotRegisterMessage = `
            Kayıt işlemini tamamlamadığınız için iş başvuru sürecine devam edemiyoruz.
            Eğer daha sonra kayıt olmak isterseniz, bize tekrar ulaşabilirsiniz.`;
      await whatsappMessage(from, phon_no_id, sendnotRegisterMessage);
      await deleteUserState(from);

      ctx.body = "confırmation no";
      return;
    }
  }


  if (checkUser && checkUser.whatsappStatus === "awaiting_user_info") {
    console.log('çalıştım334242424243');

    const userState = await getUserState(from);
    if (userState.step === 1) {
      userState.name = msg_body;
      userState.step = 2;
      await whatsappMessage(from, phon_no_id, 'Lütfen Soyadınızı girin.');
      await saveUserState(from, userState);
      ctx.body = "Lütfen  soyadınızı gönderin";

      return
    }
    if (userState.step === 2) {
      userState.surname = msg_body;
      userState.step = 3;
      await whatsappMessage(from, phon_no_id, 'Lütfen Emailinizi girin.');
      await saveUserState(from, userState);
      ctx.body = "email gonder";
      return
    }
    if (userState.step === 3) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(msg_body)) {
        await whatsappMessage(from, phon_no_id, 'Lütfen Geçerli bir email gönderin.');
        ctx.body = "geçerli bir email gönderin";
        return;
      }
      userState.email = msg_body;
      await saveUserState(from, userState);
      const firstName =
        userState.name.charAt(0).toUpperCase() +
        userState.name.slice(1).toLowerCase();
      const lastName =
        userState.surname.charAt(0).toUpperCase() +
        userState.surname.slice(1).toLowerCase();

      await ctx
        .service("users")
        .updateOne(
          { phone: from },
          {
            name: firstName,
            surname: lastName,
            email: userState.email,
            whatsappStatus: "pending_cv"
          }
        )

      await whatsappMessage(
        from,
        phon_no_id,
        "Kayıt tamamlandı!\nŞimdi PDF formatında CV'nizi gönderin."
      );
      ctx.body = "complete regıster";
      return;
    }
  }



  if (checkUser && checkUser.whatsappStatus === "pending_cv") {
    console.log('çalıştım3355555553');
    const exsistCv = await ctx
      .service("candidateCv")
      .findOne({ userId: checkUser._id });
    const userState = await getUserState(from);
    if (mediaType === "document") {
      try {
        await whatsappMessage(
          from,
          phon_no_id,
          `CV'nizi okuyoruz. Bu işlem biraz zaman alabilir...`
        );
        const takeCv = await whatsappTakeImage(mediaId);
        if (!takeCv.isSuccess) {
          await whatsappMessage(
            from,
            phon_no_id,
            "CV’nizi yüklerken bir sorun oluştu. Lütfen tekrar deneyin."
          );
          ctx.body = "upload cv";
          return;
        }

        if (!checkUser?._id || (typeof checkUser._id !== 'string' && !(checkUser._id instanceof Types.ObjectId))) {
          ctx.throw(404, "User not found");
        }
        const cv = await ctx.service("cv").create({
          userId: checkUser._id,
          fileKey: takeCv.key,
          fileName: takeCv.key,
          uploadedBy: checkUser._id,
        });

        const newData = {
          userId: checkUser._id,
          cvId: cv._id,
          experience: takeCv.pdfData.experience || [],
          education: takeCv.pdfData.education || [],
          certificates: takeCv.pdfData.certificates || [],
          languages: takeCv.pdfData.languages || [],
          skills: takeCv.pdfData.skills || [],
          contactInformation: takeCv.pdfData.contactInformation || {},
          reference: takeCv.pdfData.reference || [],
          coverLetter: takeCv.pdfData.coverLetter || "",
        };

        const data = await ctx.service("candidateCv").create(newData);
        ctx.state.cvId = data._id;
        ctx.state.user = checkUser;
        await jsontoAutoFill(ctx);
        await ctx.service("users").updateOne(
          {
            phone: from,
          },
          {
            whatsappStatus: "registered",
          }
        );


        await whatsappMessage(
          from,
          phon_no_id,
          `Özgeçmişiniz yüklendi.`
        );
        const job = await ctx.service("jobs").findById(userState.jobId);
        if (job) {
          await applyjowWithWhatsapp(ctx, checkUser, job, from, phon_no_id, exsistCv)
          await whatsappMessage(
            from,
            phon_no_id,
            ` ${job.title} pozisyonu için başvurunuz alınmıştır.   
            Başvurunuz hakkında daha fazla bilgi almak için /bilgi yazabilirsiniz.
            `
          );
          await deleteUserState(from);
          ctx.body = "cv yok";
          return;
        }


        ctx.body = "cv yok";
        return;
      } catch (error) {
        console.error("Yeni CV oluşturulurken bir hata oluştu:", error);
        await whatsappMessage(
          from,
          phon_no_id,
          "CV eklenirken bir hata oluştu. Lütfen tekrar deneyin."
        );
        ctx.body = "cv creation error";
        return;
      }
    } else {
      await whatsappMessage(
        from,
        phon_no_id,
        "Lütfen Özgeçmişiniz pdf formatında yükleyin."
      );
      ctx.body = "cv creation error";
      return;
    }
  }

  // if (
  //   checkUser &&
  //   checkUser.whatsappStatus === "registered" &&
  //   mediaType === "document"
  // ) {
  //   console.log('----------1-1-');
  //   const exsistCv = await ctx
  //     .service("candidateCv")
  //     .findOne({ userId: checkUser._id });
  //   try {
  //     await whatsappMessage(
  //       from,
  //       phon_no_id,
  //       `CV'nizi okuyoruz. Bu işlem biraz zaman alabilir...`
  //     );
  //     const takeCv = await whatsappTakeImage(mediaId);

  //     if (!takeCv.isSuccess) {
  //       await whatsappMessage(
  //         from,
  //         phon_no_id,
  //         "CV’nizi yüklerken bir sorun oluştu. Lütfen tekrar deneyin."
  //       );
  //       ctx.body = "upload cv";
  //       return;
  //     }

  //     if (!checkUser?._id || (typeof checkUser._id !== 'string' && !(checkUser._id instanceof Types.ObjectId))) {
  //       ctx.throw(404, "User not found");
  //     }

  //     const cv = await ctx.service("cv").create({
  //       userId: checkUser._id,
  //       fileKey: takeCv.key,
  //       fileName: takeCv.key,
  //       uploadedBy: checkUser._id,
  //     });

  //     const newData = {
  //       userId: checkUser._id,
  //       cvId: cv._id,
  //       experience: takeCv.pdfData.experience || [],
  //       education: takeCv.pdfData.education || [],
  //       certificates: takeCv.pdfData.certificates || [],
  //       languages: takeCv.pdfData.languages || [],
  //       skills: takeCv.pdfData.skills || [],
  //       contactInformation: takeCv.pdfData.contactInformation || {},
  //       reference: takeCv.pdfData.reference || [],
  //       coverLetter: takeCv.pdfData.coverLetter || "",
  //     };

  //     if (!exsistCv?._id || (typeof exsistCv._id !== 'string' && !(exsistCv._id instanceof Types.ObjectId))) {
  //       ctx.throw(404, "Cv not found");
  //     }


  //     const candidateCvUpdated = await ctx
  //       .service("candidateCv")
  //       .update(exsistCv._id, newData);
  //     const userId: string = checkUser._id.toString()
  //     await ctx.service("candidateExperiences").deleteMany(userId);
  //     await ctx.service("candidateEducations").deleteMany(userId);
  //     await ctx.service("candidateCertificates").deleteMany(userId);
  //     await ctx.service("candidateLanguages").deleteMany(userId);

  //     ctx.state.cvId = candidateCvUpdated._id;
  //     ctx.state.user = checkUser;

  //     await jsontoAutoFill(ctx);

  //     await whatsappMessage(
  //       from,
  //       phon_no_id,
  //       `Özgeçmişiniz başarıyla güncellendi!`
  //     );
  //     await deleteUserState(from);
  //     ctx.body = "cv var";
  //     return;
  //   } catch (error) {
  //     console.error("Mevcut CV güncellenirken bir hata oluştu:", error);
  //     await whatsappMessage(
  //       from,
  //       phon_no_id,
  //       "CV güncellenirken bir hata oluştu. Lütfen tekrar deneyin."
  //     );
  //     ctx.body = "cv update error";
  //     return;
  //   }
  // }


  if (msg_body && checkUser && checkUser.whatsappStatus === "registered" && !(msg_body === "/bilgi")) {
    const exsistCv = await ctx
      .service("candidateCv")
      .findOne({ userId: checkUser._id });

    const userState = await getUserState(from);
    const job = await ctx.service("jobs").findById(userState.jobId);
    if (!job) {
      const message = `Paylaştığınız ilana dair herhangi bir kayıt sistemimizde bulunamadı.
      Yeni iş fırsatlarını keşfetmek veya ilan yayınlamak için aşağıdaki bağlantıya göz atabilirsiniz:
      👉 https://jobs.heplin.com/tr
      
      Başvurduğunuz ilanlara yönelik bilgi almak için /bilgi yazabilirsiniz.

      İyi günler dileriz,
      T3 Vakfı Mülakat Sistemi`;
      await whatsappMessage(from, phon_no_id, message);
      ctx.body = message;
      return;
    }
    if (job) {
      await applyjowWithWhatsapp(ctx, checkUser, job, from, phon_no_id, exsistCv)
      ctx.body = "cv yok";
      deleteUserState(from);
      return;
    }
  }
}