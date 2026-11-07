import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { AccessTime, ArticleOutlined, CalendarMonth, LockOutlined, VideocamOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SeverityPill, SeverityPillColor } from 'src/components/severity-pill';

const BRAND = '#E31E24';

const statusColor = (status?: string): SeverityPillColor => {
    switch (status) {
        case 'completed':
            return 'success';
        case 'started':
            return 'info';
        case 'pending':
            return 'warning';
        case 'expired':
            return 'error';
        default:
            return 'warning';
    }
};

const InterviewCard = ({ interview, onClick }: { interview: any, onClick: (interview: any) => void }) => {
    const { t } = useTranslation();

    const expirationDate = interview?.expirationDate ? new Date(interview.expirationDate) : null;
    const isExpired = expirationDate ? new Date() > expirationDate : false;
    const locked = Boolean(interview?.accessLocked) || isExpired;
    const isVideo = interview?.interviewType === 'video';

    return (
        <Card
            variant="outlined"
            onClick={() => (locked ? undefined : onClick(interview))}
            sx={{
                position: 'relative',
                borderRadius: 3,
                height: '100%',
                opacity: locked ? 0.6 : 1,
                cursor: locked ? 'default' : 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': locked
                    ? undefined
                    : {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 10px 28px rgba(15,23,42,0.1)',
                        borderColor: BRAND,
                    },
            }}
        >
            {locked && (
                <LockOutlined
                    sx={{ position: 'absolute', top: 12, right: 12, fontSize: 18, color: 'text.disabled' }}
                />
            )}
            <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${BRAND}14`,
                            color: BRAND,
                        }}
                    >
                        {isVideo ? <VideocamOutlined /> : <ArticleOutlined />}
                    </Box>
                    <SeverityPill color={statusColor(interview?.status)}>
                        {t(interview?.status || 'pending')}
                    </SeverityPill>
                </Stack>

                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                    {interview?.name || t('InterviewNameNotSpecified')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {t(interview?.interviewType + 'L')}
                </Typography>

                <Stack spacing={0.75} sx={{ mt: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                        <AccessTime sx={{ fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary">
                            {t('totalTime')}: {interview?.totalDuration || 0} dakika
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                        <CalendarMonth sx={{ fontSize: 18 }} />
                        <Typography variant="body2" color={isExpired ? 'error.main' : 'text.secondary'}>
                            {t('lastDate')}: {expirationDate ? expirationDate.toLocaleDateString('tr-TR') : '-'}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default InterviewCard;
