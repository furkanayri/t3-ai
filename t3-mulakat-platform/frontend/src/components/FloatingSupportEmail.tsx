import { SupportAgentOutlined, Send, AttachFile, Close } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography, TextField, Button, CircularProgress, Alert, Divider, Chip } from "@mui/material";
import { useMemo, useState, useRef } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { isAccountsApp } from "src/utils";
import { useAuth } from "src/providers";

const SUPPORT_EMAIL = "bursiyer@turkiyeteknolojitakimi.org";
const TELEGRAM_ENDPOINT = "https://pnu4uzclxa.execute-api.eu-west-1.amazonaws.com/default/telegram_endpoint";

export function FloatingSupportEmail() {
    const location = useLocation();
    const { t } = useTranslation();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const isAccounts = isAccountsApp();

    const isLoginPage = useMemo(() => {
        return ['/login', '/reset-password', '/forgot-password', '/register', '/create-account'].includes(
            location.pathname
        ) || location.pathname.includes('/reset-password/');
    }, [location.pathname]);

    if (!isAccounts || isLoginPage) {
        return null;
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Dosya boyutu kontrolü (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(t('telegram_support.file_too_large', 'Dosya boyutu 5MB\'dan küçük olmalıdır'));
                return;
            }
            // Dosya tipi kontrolü (sadece resimler)
            if (!file.type.startsWith('image/')) {
                setError(t('telegram_support.only_images', 'Sadece resim dosyaları yüklenebilir'));
                return;
            }
            setSelectedFile(file);
            setError("");
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const sendToTelegram = async () => {
        if (!title.trim() || !description.trim() || !phoneNumber.trim()) {
            setError(t('telegram_support.fill_all_fields', 'Lütfen tüm alanları doldurun'));
            return;
        }

        setIsSending(true);
        setError("");

        try {
            let base64Image = null;

            // Eğer dosya seçildiyse Base64'e çevir
            if (selectedFile) {
                base64Image = await fileToBase64(selectedFile);
            }

            const userInfo = user
                ? `\n\n👤 *Kullanıcı Bilgileri:*\nAd: ${user.name || '-'}\nSoyad: ${user.surname || '-'}\nEmail: ${user.email || '-'}\nTelefon: ${phoneNumber}`
                : `\n\n📞 *Telefon:* ${phoneNumber}`;

            const message = `📩 *Yeni Destek Talebi*\n\n*Başlık:* ${title}\n\n*Açıklama:*\n${description}${userInfo}`;

            const response = await fetch(TELEGRAM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    image: base64Image, // Resim varsa gönder, yoksa null
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTitle("");
                setDescription("");
                setPhoneNumber("");
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            } else {
                throw new Error(data.error || 'Mesaj gönderilemedi');
            }
        } catch (err) {
            setError(t('telegram_support.send_error', 'Mesaj gönderilirken bir hata oluştu'));
            console.error('Telegram send error:', err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.3s ease',
            }}
        >
            {isOpen && (
                <Box
                    sx={{
                        backgroundColor: 'background.paper',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        px: 2.5,
                        py: 1.5,
                        boxShadow: 4,
                        animation: 'slideIn 0.3s ease',
                        minWidth: 320,
                        maxWidth: 400,
                        '@keyframes slideIn': {
                            from: {
                                opacity: 0,
                                transform: 'translateX(20px)',
                            },
                            to: {
                                opacity: 1,
                                transform: 'translateX(0)',
                            },
                        },
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5,
                            fontSize: '0.7rem',
                        }}
                    >
                        {t('support.contactLabel')}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem',
                            mb: 2,
                        }}
                    >
                        {SUPPORT_EMAIL}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            mb: 1.5,
                            color: 'text.primary',
                        }}
                    >
                        {t('telegram_support.title', 'Bize Yazın')}
                    </Typography>

                    {success ? (
                        <Alert severity="success" sx={{ mb: 1 }}>
                            {t('telegram_support.success', 'Mesajınız başarıyla gönderildi!')}
                        </Alert>
                    ) : (
                        <>
                            <TextField
                                fullWidth
                                size="small"
                                label={t('telegram_support.title_label', 'Başlık')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSending}
                                placeholder={t('telegram_support.title_placeholder', 'Konu başlığı...')}
                                sx={{ mb: 1.5 }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label={t('telegram_support.phone_label', 'Telefon Numarası')}
                                value={phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9+]/g, '');
                                    setPhoneNumber(value);
                                }}
                                disabled={isSending}
                                placeholder={t('telegram_support.phone_placeholder', '+90 555 123 45 67')}
                                sx={{ mb: 1.5 }}
                                required
                                inputProps={{
                                    inputMode: 'tel',
                                    pattern: '[0-9+]*'
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                multiline
                                rows={3}
                                label={t('telegram_support.description_label', 'Açıklama')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSending}
                                placeholder={t('telegram_support.description_placeholder', 'Detaylı açıklama...')}
                                sx={{ mb: 1.5 }}
                            />

                            <Box sx={{ mb: 1.5 }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    id="support-file-input"
                                />
                                <label htmlFor="support-file-input">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AttachFile />}
                                        disabled={isSending}
                                        fullWidth
                                    >
                                        {t('telegram_support.attach_image', 'Görsel Ekle')}
                                    </Button>
                                </label>

                                {selectedFile && (
                                    <Chip
                                        label={selectedFile.name}
                                        onDelete={handleRemoveFile}
                                        deleteIcon={<Close />}
                                        size="small"
                                        sx={{ mt: 1, maxWidth: '100%' }}
                                    />
                                )}
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 1.5 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                onClick={sendToTelegram}
                                disabled={isSending || !title.trim() || !description.trim() || !phoneNumber.trim()}
                                startIcon={isSending ? <CircularProgress size={16} /> : <Send />}
                                sx={{
                                    backgroundColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                            >
                                {isSending
                                    ? t('telegram_support.sending', 'Gönderiliyor...')
                                    : t('telegram_support.send', 'Gönder')
                                }
                            </Button>
                        </>
                    )}
                </Box>
            )}

            <Tooltip title={isOpen ? "" : t('support.title')} placement="left">
                <IconButton
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        boxShadow: 3,
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                            transform: 'scale(1.05)',
                            boxShadow: 5,
                        },
                        transition: 'all 0.3s ease',
                        width: 56,
                        height: 56,
                    }}
                >
                    <SupportAgentOutlined sx={{ fontSize: 30 }} />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
