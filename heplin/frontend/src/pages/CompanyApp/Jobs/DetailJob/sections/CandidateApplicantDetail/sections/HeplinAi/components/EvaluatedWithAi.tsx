import { Card, CardContent, Typography, Box, Stack, CircularProgress } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import { ApplicantMatchingRateChip } from 'src/pages/CompanyApp/Jobs/DetailJob/components';
import ScoreIcon from '@mui/icons-material/Score';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SummarizeIcon from '@mui/icons-material/Summarize';

const EvaluatedWithAi = ({ evaluateData }: { evaluateData: any }) => {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    if (!evaluateData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Card sx={{ boxShadow: 2, border: '1px solid', borderColor: 'primary.main', }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Header />

                        <Stack direction="row" spacing={1} alignItems="center">
                            <ScoreIcon color="primary" />
                            <Typography variant="h6">{t('candidateScore')}</Typography>
                            <ApplicantMatchingRateChip rate={evaluateData?.candidateScore * 10} />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={{ mt: 1, boxShadow: 2, border: '1px solid', borderColor: 'primary.main', }}>
                <CardContent>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <EmojiEmotionsIcon color="success" />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {t('candidateStrengths')}
                            </Typography>
                        </Stack>
                        <Stack spacing={1}>
                            {evaluateData?.candidateStrengths?.map((item: any, index: number) => (
                                <Box key={index}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item?.strength[language]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                        {item?.description[language]}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={{ mt: 1, boxShadow: 2, border: '1px solid', borderColor: 'primary.main', }}>
                <CardContent>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ThumbDownIcon color="error" />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {t('candidateweakness')}
                            </Typography>
                        </Stack>
                        <Stack spacing={1}>
                            {evaluateData?.candidateMissing?.map((item: any, index: number) => (
                                <Box key={index}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item?.skill[language]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                        {item?.description[language]}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={{ mt: 1, boxShadow: 2, border: '1px solid', borderColor: 'primary.main', }}>
                <CardContent>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <LightbulbIcon color="warning" />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {t('improvementSuggestions')}
                            </Typography>
                        </Stack>
                        <Stack spacing={0.5} sx={{ ml: 2 }}>
                            {evaluateData?.improvementSuggestions?.map((item: any, index: number) => (
                                <Typography key={index} variant="body2">
                                    • {item[language]}
                                </Typography>
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={{ mt: 1, boxShadow: 2, border: '1px solid', borderColor: 'primary.main', mb: 2 }}>
                <CardContent>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <SummarizeIcon color="secondary" />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {t('summary')}
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            {evaluateData?.summary?.[language]}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EvaluatedWithAi;