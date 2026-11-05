import {
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Grid,
    Box,
    Stack
} from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePersonalTestQuery } from 'src/hooks/useServices/usePersonalTestServices';
import { useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function PersonalTestTab() {
    const [searchParams] = useSearchParams();
    const candidateId = useMemo(() => searchParams.get('candidateId'), [searchParams]) as string;
    const { t, i18n } = useTranslation();
    const language = i18n.language;
    const personalTestQuery = usePersonalTestQuery({ candidateId });

    return (
        <Box sx={{ mt: 4, mx: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'center' }}>
            <Card
                sx={{

                    width: '100%',
                    borderRadius: 3,
                    boxShadow: 50,
                    border: '2px solid primary.main',
                }}
            >
                <CardHeader
                    title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {t('personalTest')}
                        </Typography>
                    }
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        textAlign: 'center',
                        height: "40px",
                        paddingY: 2,
                    }}
                />
                <CardContent>
                    {personalTestQuery.isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : personalTestQuery.isSuccess && personalTestQuery.data?.personalTest ? (
                        <Grid container >
                            {/* Personal Attributes */}
                            <Grid item xs={12} sm={12}>
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                    {t('personalAttributes')}
                                </Typography>
                                <List>
                                    {/* Perfectionism */}
                                    <ListItem>
                                        <Stack direction="row" spacing={2} width="100%">
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', width: '200px' }}>
                                                {t('perfectionism')}:
                                            </Typography>
                                            <Typography variant="body1">
                                                {personalTestQuery.data.personalTest.perfectionism}
                                            </Typography>
                                        </Stack>
                                    </ListItem>
                                    {/* Ambition */}
                                    <ListItem>
                                        <Stack direction="row" spacing={2} width="100%">
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', width: '200px' }}>
                                                {t('ambition')}:
                                            </Typography>
                                            <Typography variant="body1">
                                                {personalTestQuery.data.personalTest.ambition}
                                            </Typography>
                                        </Stack>
                                    </ListItem>
                                    {/* Motivation */}
                                    <ListItem>
                                        <Stack direction="row" spacing={2} width="100%">
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', width: '200px' }}>
                                                {t('motivation')}:
                                            </Typography>
                                            <Typography variant="body1">
                                                {personalTestQuery.data.personalTest.motivation}
                                            </Typography>
                                        </Stack>
                                    </ListItem>
                                    {/* Desire for Leadership */}
                                    <ListItem>
                                        <Stack direction="row" spacing={2} width="100%">
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', width: '200px' }}>
                                                {t('desireForLeadership')}:
                                            </Typography>
                                            <Typography variant="body1">
                                                {personalTestQuery.data.personalTest.desireForLeadership}
                                            </Typography>
                                        </Stack>
                                    </ListItem>
                                </List>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Strengths */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" color="success.main" gutterBottom>
                                    {t('strengths')}
                                </Typography>
                                <List>
                                    {personalTestQuery.data.personalTest.strengths[language]?.map((strength: string, index: number) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <CheckCircleIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary={strength} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Weaknesses */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" color="error.main" gutterBottom>
                                    {t('weaknesses')}
                                </Typography>
                                <List>
                                    {personalTestQuery.data.personalTest.weaknesses[language]?.map((weakness: string, index: number) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <HighlightOffIcon color="error" />
                                            </ListItemIcon>
                                            <ListItemText primary={weakness} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', my: 4 }}>
                            {t('noPersonalTestTaken')}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}