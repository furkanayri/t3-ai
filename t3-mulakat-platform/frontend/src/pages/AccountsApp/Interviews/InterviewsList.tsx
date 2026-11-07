import { Card, CardHeader, } from "@mui/material";
import { Box, Container } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useRouter } from "src/hooks/use-router";
import { useAiInterviewAnswersMutation, useAiInterviewAnswersQuery, useAiVidoeInterviewAnswersQuery, useUpdateStatusInterviewVideo } from "src/hooks/useServices";
import { array } from "src/utils";
import { enqueueSnackbar } from 'notistack';
import { Outlet, useParams } from "react-router";
import { useEffect } from "react";
import InterviewTable from "./components/InterviewTable";
import { useGetAllCandidateInterviewQuery } from "src/hooks/useServices/useInterviewServices";
import InterviewProvider, { useInterview } from "./InterviewContext/InterviewProvider";
import Interviews from "./components/Interviews";

export function Component() {
    const route = useRouter();
    const { t } = useTranslation();
    const { interviewId } = useParams<{ interviewId: string }>();
    return (
        <InterviewProvider>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                }}
            >
                <Interviews />
            </Box>
        </InterviewProvider>
    );
}

Component.displayName = 'InterviewsList';

