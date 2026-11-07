import React, { useState } from 'react';
import { useFormik, FieldArray, Field, FormikProvider } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Grid, Table, TableBody, TableCell, TableRow, TextField, Typography, Box, Container, Stack, Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import PageHeader from './PageHeader';
import TextInterview from 'src/pages/AccountsApp/Answer/section/TextInterview';
import VideoInterview from 'src/pages/AccountsApp/Answer/section/VideoInterview';


export function Component() {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('text-interview');
    return (
        <Box component="main" flexGrow={1}>
            <Container maxWidth="xl">
                <Stack spacing={3} sx={{ mb: 3 }}>
                    <PageHeader title={t('InterviewQuestions')} />
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        aria-label="interview-tabs"
                    >
                        <Tab label={t("TextInterview")} value={"text-interview"} />
                        <Tab label={t("VideoInterview")} value={"video-interview"} />
                    </Tabs>
                    {
                        activeTab === "text-interview" && <TextInterview />
                    }
                    {
                        activeTab === "video-interview" && <VideoInterview />
                    }
                </Stack>
            </Container>
        </Box>
    );
}

Component.displayName = 'InterviewQuestions';


