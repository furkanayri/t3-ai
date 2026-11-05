import React, { useState } from 'react';
import { Card, CardContent, CircularProgress, Typography, Button } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { MagicWand01Icon } from 'hugeicons-react';
import { array } from 'src/utils';
import { useVideoInterviewEvaluation, useVideoInterviewEvaluationQuery } from 'src/hooks/useServices';

const VideoInterviewEvaluate = ({ interviewResultsQuery, candidateInterviewId, candidateAnswersId }: { interviewResultsQuery: any, candidateInterviewId: string, candidateAnswersId: any }) => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const [isEvaluating, setIsEvaluating] = useState(false);
    const candidateId = React.useMemo(() => searchParams.get('candidateId'), [searchParams]);


    // artık  evaluationQuery buna ihtiyac olmadan yapılablir.
    // const evaluationQuery = useVideoInterviewEvaluationQuery(candidateInterviewId);
    const videoInterviewEvaluateMutation = useVideoInterviewEvaluation();
    const interviewResults = array(interviewResultsQuery?.data?.results)
    console.log(interviewResults);

    const handleEvaluate = async () => {
        if (!id || !candidateId) return;
        setIsEvaluating(true);
        try {
            await videoInterviewEvaluateMutation.mutateAsync({
                interviewId: candidateInterviewId,
                candidateAnswersId: candidateAnswersId?._id
            });
            await interviewResultsQuery.refetch();
        } catch (error) {
            console.error("Evaluation failed:", error);
        } finally {
            setIsEvaluating(false);
        }
    };


    if (interviewResultsQuery.isLoading) {
        return (
            <div className="w-full flex items-center justify-center h-full">
                <CircularProgress size={24} />
            </div>
        );
    }

    const evaluationData = interviewResultsQuery?.data?.results[0];


    return (
        <Box sx={{ mt: 4 }}>
            <Card
                sx={{
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: 50,
                    border: '2px solid primary.main',
                }}
            >
                <CardContent>
                    {evaluationData?.isEvaluated ? (
                        <div>
                            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: "#E31E24" }}>
                                {t("Evaluation Results")}
                            </Typography>
                            <Box display="flex" alignItems="center" sx={{ mt: 4, color: "#E31E24" }}>
                                <MagicWand01Icon size={28} color={"#E31E24"} />
                                <Typography variant="h6" sx={{ ml: 2 }}>
                                    {t('evaluationScore')}: % {evaluationData?.evaluationScore}
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ mt: 4, color: "#E31E24", fontWeight: 'bold' }}>
                                {t("Evaluation")}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mt: 2, }}>
                                {evaluationData?.interviewEvaluate?.generalEvaluation[i18n?.language]}
                            </Typography>

                            <div>
                                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                                    {evaluationData?.interviewEvaluate?.evaluation[i18n?.language].map((item: any, index: number) => (
                                        <li
                                            key={index}
                                            className="flex justify-between gap-2 items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                                        >
                                            <span>{item?.evaluation}</span>
                                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                ⭐ {item?.score}/10
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        </div>
                    ) : (
                        null
                    )}
                    {!evaluationData?.isEvaluated && interviewResults.length > 0 && (
                        <div className="w-full flex items-center justify-center mb-4 space-x-10">
                            <p className="font-extrabold text-xl text-gray-500">
                                {t("No evaluation has been performed yet.")}
                            </p>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEvaluate}
                                disabled={isEvaluating}
                            >
                                {t("Evaluate")}
                            </Button>

                        </div>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default VideoInterviewEvaluate;