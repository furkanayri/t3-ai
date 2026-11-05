import TelegramBot from "node-telegram-bot-api";
import { applyjobWithTelegram, telegramTakeCv } from "./telegramUtils";
import jsontoAutoFillTelegram from "./jsonToAutoFillTelegram";
import { redisClient } from "@/utils";
import { uuid } from "uuidv4";
import bcrypt from "bcryptjs";

let bot: TelegramBot | null = null;

const saveUserState = async (chatId: number, state: object) => {
    const key = `userState:${chatId}`;
    await redisClient.set(key, JSON.stringify(state), { EX: 3600 }); // 1 saat zaman aşımı
};

const getUserState = async (chatId: number) => {
    const key = `userState:${chatId}`;
    const state = await redisClient.get(key);
    return state ? JSON.parse(state) : {};
};

function generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
}

export default async function telegramBot(ctx: any) {



    if (!bot) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            console.error("TELEGRAM_BOT_TOKEN env değişkeni bulunamadı!");
            return;
        }

        bot = new TelegramBot(token, { polling: true });

        bot.on("polling_error", (err) => {
            console.error("Telegram polling error:-1", err.message);
        });

        bot.on("callback_query", async (callbackQuery) => {
            try {
                const data = callbackQuery.data;
                const message = callbackQuery.message;
                if (!message) return;

                const chatId = message.chat.id;
                let userState = await getUserState(chatId);
                let user = await ctx.service("users").findOne({ telegramChatId: chatId });
                if (!user) return;



                if (data?.startsWith("register_")) {
                    const response = data.replace("register_", "");
                    if (response === "yes") {
                        await bot.sendMessage(chatId, "Lütfen aşağıdaki linkleri okuyun ve kabul ettiğinizi belirtin:\nKVKK: https://accounts.heplin.com/kvkk\nTerms and Conditions: https://accounts.heplin.com/terms-and-conditions", {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "Kabul Ediyorum", callback_data: "accept_terms" },
                                        { text: "Kabul Etmiyorum", callback_data: "decline_terms" },
                                    ],
                                ],
                            },
                        });
                    } else {
                        await bot.sendMessage(chatId, "Kayıt işlemini tamamlamadığınız için başvuru sürecine devam edemiyoruz. 🙁");
                        await ctx.service("users").updateOne({ telegramChatId: chatId }, { telegramStatus: "cancelled" });
                    }
                    await bot.answerCallbackQuery(callbackQuery.id);
                    return;
                }

                if (data === "accept_terms") {
                    await ctx.service("users").updateOne(user._id, { isAcceptedKVKK: true });
                    userState.infoStep = 1;
                    await saveUserState(chatId, userState);
                    await bot.sendMessage(chatId, "Kayıt işlemini başlatıyoruz.\nAdınızı yazın:");
                    await ctx.service("users").updateOne({ telegramChatId: chatId }, { telegramStatus: "awaiting_user_info" });
                    await bot.answerCallbackQuery(callbackQuery.id);
                    return;
                }

                if (data === "decline_terms") {
                    await ctx.service("users").updateOne(user._id, { isAcceptedKVKK: false });
                    await bot.sendMessage(chatId, "Kayıt işlemini tamamlamadığınız için başvuru sürecine devam edemiyoruz. 🙁");
                    await bot.answerCallbackQuery(callbackQuery.id);
                    return;
                }


            } catch (err) {
                // console.error("callback_query hatası:", err);
                // console.error("callback_query hatası:", err.message);
            }
        });

        bot.on("message", async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text?.trim() || "";
            let userState = await getUserState(chatId);
            let user = await ctx.service("users").findOne({ telegramChatId: chatId });
            if (!user) {
                user = await ctx.service("users").create({
                    telegramChatId: chatId,
                    telegramStatus: "start",
                    email: `${uuid()}@heplin.com`
                });
            }

            try {
                if (text.startsWith("/bilgi") && user.telegramStatus === "registered") {
                    try {
                        const jobApplications = await ctx.service('jobApplications').findAll({ userId: user._id });
                        let allMessages = [];
                        for (const jobApplication of jobApplications.results) {
                            const job = await ctx.service('jobs').findOne({ _id: jobApplication?.jobId });

                            let message = '';

                            if (jobApplication && jobApplication.viewedBy && jobApplication.viewedBy.length > 0) {
                                const isSeen = jobApplication.viewedBy.find(view => view.isSeen === true);

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
                            await bot.sendMessage(chatId, combinedMessage);
                        } else {
                            const noApplicationsMessage = `Henüz başvurunuz bulunmamaktadır.`;
                            await bot.sendMessage(chatId, noApplicationsMessage);
                        }
                    }
                    catch (error) {
                        console.error('Başvuru sonuçları alınırken hata oluştu: 0',);

                        const message = `Başvuru sonuçlarınızı incelereken bir sorun ile karşılaştım. Lütfen daha sonra tekrar deneyin.`;
                        await bot.sendMessage(chatId, message);

                        ctx.throw(500, message);
                    }
                }
                if (text.startsWith("/start")) {
                    const params = text.split(" ");
                    if (params.length > 1) {
                        // Extract the jobId parameter
                        const jobIdParam = params[1];
                        const jobIdMatch = jobIdParam.match(/^jobId=([\w-]+)$/);
                        const selectedJob = await ctx.service("jobs").findById(jobIdMatch[1]);
                        await bot.sendMessage(chatId, "Hoş geldiniz! Başvurmak istediğiniz iş ilanı:\n" + selectedJob.title + " 💼");
                        await applyjobWithTelegram(ctx, user, selectedJob, selectedJob.tenantId, chatId, bot);
                    }
                }
                if (user.telegramStatus === "start") {
                    await bot.sendMessage(chatId, "Lütfen telefon numaranızı paylaşın:", {
                        reply_markup: {
                            keyboard: [
                                [{ text: "Telefon numaramı paylaş", request_contact: true }],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    });
                    await ctx.service("users").updateOne({ telegramChatId: chatId }, { telegramStatus: "awaiting_phone" });
                    return;
                }

                if (user.telegramStatus === "awaiting_phone") {
                    if (msg.contact) {
                        const phoneNumber = msg.contact.phone_number;
                        const existingUser = await ctx.service("users").findOne({ phone: phoneNumber });

                        if (existingUser) {
                            user = existingUser;
                            user.exsistCv = await ctx.service("candidateCv").findOne({ userId: user._id });
                            await ctx.service("users").updateOne({ telegramChatId: chatId }, { telegramStatus: "registered" });
                            await bot.sendMessage(chatId, "Sistemimizde zaten kayıtlısınız! 🎉");
                        } else {
                            await bot.sendMessage(chatId, "Sistemimizde kayıtlı değilsiniz. Kayıt olmak ister misiniz?", {
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            { text: "Evet", callback_data: "register_yes" },
                                            { text: "Hayır", callback_data: "register_no" },
                                        ],
                                    ],
                                },
                            });
                            await ctx.service("users").updateOne({ telegramChatId: chatId }, { phone: phoneNumber, telegramStatus: "awaiting_registration" });
                        }
                    } else {
                        await bot.sendMessage(chatId, "Telefon numarası paylaşılmadı. Lütfen tekrar deneyin.");
                        return;
                    }

                }

                if (user.telegramStatus === "awaiting_user_info") {
                    if (!userState.infoStep) {
                        userState.infoStep = 1;
                        await saveUserState(chatId, userState);
                        await bot.sendMessage(chatId, "Adınızı yazın:");
                        return;
                    }

                    if (userState.infoStep === 1) {
                        userState.firstName = text;
                        userState.infoStep = 2;
                        await saveUserState(chatId, userState);
                        await bot.sendMessage(chatId, "Soyadınızı yazın:");
                        return;
                    }

                    if (userState.infoStep === 2) {
                        userState.lastName = text;
                        userState.infoStep = 3;
                        await saveUserState(chatId, userState);
                        await bot.sendMessage(chatId, "Mailinizi yazın:");
                        return;
                    }

                    if (userState.infoStep === 3) {
                        // ...existing code to validate email...
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailPattern.test(text)) {
                            await bot.sendMessage(chatId, "Geçerli bir e-posta adresi girin:");
                            return;
                        }
                        userState.email = text;
                        const firstName =
                            userState.firstName.charAt(0).toUpperCase() +
                            userState.firstName.slice(1).toLowerCase();
                        const lastName =
                            userState.lastName.charAt(0).toUpperCase() +
                            userState.lastName.slice(1).toLowerCase();

                        const tempPassword = generateRandomPassword();
                        const hashedPw = bcrypt.hashSync(tempPassword, 10);

                        await ctx.service("users").updateOne(
                            { telegramChatId: chatId },
                            {
                                name: firstName,
                                surname: lastName,
                                email: userState.email,
                                telegramStatus: "pending_cv",
                                password: hashedPw,
                            }
                        );
                        await bot.sendMessage(
                            chatId,
                            "Kayıt tamamlandı!\nŞimdi PDF formatında CV'nizi gönderin."
                        );
                        return;
                    }
                }
                if (user.telegramStatus === "pending_cv") {
                    if (!msg.document || msg.document.mime_type !== "application/pdf") {
                        await bot.sendMessage(chatId, "Lütfen PDF formatında CV'nizi gönderin.");
                        return;
                    }

                    const fileId = msg.document.file_id;
                    const mimeType = msg.document.mime_type; // "application/pdf" vs

                    if (mimeType !== "application/pdf") {
                        await bot.sendMessage(chatId, "Lütfen CV'nizi PDF formatında yükleyin.");
                        return;
                    }

                    const fileLink = await bot.getFileLink(fileId);
                    await bot.sendMessage(chatId, "CV'nizi okuyoruz. Bu işlem biraz zaman alabilir...");
                    const takeCv = await telegramTakeCv(fileLink);
                    if (!takeCv) {
                        await bot.sendMessage(chatId, "CV'nizi okuyamadık. Lütfen tekrar deneyin.");
                        return;
                    } else {
                        await bot.sendMessage(chatId, "Özgeçmişiniz yüklendi.");
                    }

                    const cv = await ctx.service("cv").create({
                        userId: user._id,
                        fileKey: takeCv.key,
                        fileName: takeCv.key,
                        uploadedBy: user._id,
                    });

                    const candidateData = {
                        userId: user._id,
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

                    const data = await ctx.service("candidateCv").create(candidateData);
                    await jsontoAutoFillTelegram(ctx, data._id, user._id);
                    await ctx.service("users").updateOne({ telegramChatId: chatId }, { telegramStatus: "registered" });
                    return;
                }

                if (user.telegramStatus === "registered" && !text.startsWith("/start")) {

                    try {
                        const jobNotFoundMessage = `Merhaba ben Heplin Bot. 🤖
Yeni iş fırsatlarını keşfetmek için bağlantıya göz atabilirsiniz: 👉 https://jobs.heplin.com/tr
Başvurduğunuz ilanlara yönelik bilgi almak için /bilgi yazabilirsiniz.

İyi günler dileriz,
Heplin Ekibi`;
                        await bot.sendMessage(chatId, jobNotFoundMessage);
                        return;
                    } catch (error) {
                        console.error("Telegram bot hatası: 1",);
                        await bot.sendMessage(chatId, "Bir hata oluştu. Lütfen tekrar deneyin.");
                    }
                }
            } catch (error) {
                console.error("Telegram bot hatası 2");
                await bot.sendMessage(chatId, "Bir hata oluştu. Lütfen tekrar deneyin.");
            }

        });
    }
}
