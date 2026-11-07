
import { Button, Card, CardContent, CardHeader, Chip, CircularProgress, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useAiEvaulationMutation, useArchiveAiEvaulationMutation, useGetAiEvaluationQuery, useGetArchiveAiEvaluationQuery } from 'src/hooks/useServices'
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useCandidateDetail } from '../../ArchiveCandidateApplicantDetail';
import Header from './components/HeplinAiHeader';
import EvaluatedWithAi from './components/ArchiveEvaluatedWithAi';

export default function ArchiveHeplinAiTab() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { id } = useParams()
    const { t } = useTranslation()

    const candidateId = useMemo(() => searchParams.get('candidateId'), [searchParams]) as string

    const evaluationQuery = useGetArchiveAiEvaluationQuery(candidateId, id || '')
    const evaluateData = evaluationQuery?.data
    const aiEvaluationMutation = useArchiveAiEvaulationMutation()

    const { candidateState } = useCandidateDetail()
    const appliedJobObject = candidateState?.data?.appliedJobs?.find(job => job?.jobId?._id === id) || null;



    const handleSubmit = () => {
        const payload = {
            jobId: id,
            candidateId: candidateId,
        }
        aiEvaluationMutation.mutateAsync({ fileKey: appliedJobObject?.cv?.fileKey, payload }, {
            onSuccess(data, variables, context) {
                evaluationQuery.refetch()
            },
            onError(err: any) {
                enqueueSnackbar(t(((err.response.data as any).message)), { variant: 'error' })
            }
        }
        )
    }


    return (
        <div className='mt-4 space-y-2 mx-4'>
            {
                evaluationQuery?.data?.length <= 0 ?
                    <div>
                        <Card>
                            <CardHeader
                                title={<Header />}
                            />
                            <CardContent>
                                <div className='flex gap-5 items-center justify-center'>
                                    <div className='bg-red-200 py-2 px-3 rounded-2xl w-full'>
                                        <Typography variant="body1">{t('candidatehaveNotevaluate')}</Typography>
                                    </div>
                                    <Button variant='outlined' onClick={handleSubmit}>
                                        {
                                            aiEvaluationMutation.isLoading ? <CircularProgress /> : t("Evaluate")
                                        }
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    : <EvaluatedWithAi evaluateData={evaluateData} />
            }

        </div>
    )
}
