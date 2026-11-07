import { Box, Chip, List, ListItem, Stack, Typography } from '@mui/material';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { ApplicantForm } from 'src/pages/CompanyApp/Jobs/DetailJob/sections/CandidateApplicantDetail/CandidateApplicantDetail';
import QuestionAnswerList from 'src/pages/CompanyApp/Jobs/DetailJob/sections/CandidateApplicantDetail/sections/OverviewTab/sections/AppliedJobs/QuestionAnswerList';

const ApplicationFormTab = ({ questions, answers }: { questions: any, answers: any }) => {
    const { t } = useTranslation();
    return (
        <Box>
            <Typography variant="h5" marginBottom={2} fontWeight={600}>{t('answers')}</Typography>
            <QuestionAnswerList questions={questions} answers={answers} />
        </Box>
    )
}

export default ApplicationFormTab