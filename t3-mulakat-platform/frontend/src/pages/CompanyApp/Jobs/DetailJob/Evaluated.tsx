import { useGetAllJobApplicationsQuery } from "src/hooks/useServices";
import { useDetailJob } from "./DetailJobProvider";
import { array } from "src/utils";
import { Alert, Avatar, Box, Container, Stack, Theme, Typography, useMediaQuery } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useGetCandidateEvaluation } from "src/hooks/useServices/useCandidateEvaluation";
import { EvaluatedCandidate } from "./components";
import { Paginate } from "src/components/shared";
import { useTranslation } from "react-i18next";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { IconButton } from '@mui/material';
export function Component() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const { jobState } = useDetailJob();

    const [applicantPage, setApplicantPage] = useState(0)

    const jobApplicants = useGetAllJobApplicationsQuery({ jobId: jobState?.data?._id ?? '', page: applicantPage, limit: 5 })
    const applicants = array<any>(jobApplicants.data?.results);
    const pageSizes = [1, 6, 12]
    const candidateId = useMemo(() => searchParams.get('applicant'), [searchParams]) ?? applicants[0]?.candidateId?._id

    const page = useMemo(() => Number(searchParams.get('page')?.toString()) || 0, [searchParams]);

    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

    const candidateEvaluationsQuery = useGetCandidateEvaluation(candidateId ?? '', query)
    const candidateEvaluations = array(candidateEvaluationsQuery?.data?.results);

    const handleClick = (id: string) => {
        setSearchParams((prev) => {
            prev.set('applicant', id);
            return prev;
        })
        setSearchParams((prev) => {
            prev.set('page', String(0));
            return prev;
        })
    }
    const matches = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    pb: 2,
                    borderBottom: '2px solid #f0f0f0'
                }}>
                    <Box sx={{
                        width: 4,
                        height: 28,
                        backgroundColor: '#E31E24',
                        borderRadius: 1
                    }} />
                    <Typography variant="h5" sx={{
                        fontWeight: 600,
                        color: '#1a1a1a',
                        fontSize: '1.5rem'
                    }}>
                        Değerlendirmeler
                    </Typography>
                </Box>
            </Box>
            {!applicants.length ?
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                    {t('noCandidatesFound')}
                </Alert>
                :
                <Stack
                    direction='row'
                    spacing={3}
                    sx={{ mb: 3 }}
                >
                    <div>

                        <Box minWidth={250} minHeight={250} sx={{
                            backgroundColor: 'white',
                            p: 2,
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            border: '1px solid #f0f0f0',
                        }}>
                            <Stack spacing={2}>
                                {applicants?.map((applicant: any) => {


                                    const isSelected = applicant?.candidateId?._id === candidateId
                                    return (
                                        <Box
                                            key={applicant?._id}
                                            onClick={() => handleClick(applicant?.candidateId?._id)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: '8px',
                                                backgroundColor: isSelected ? '#E31E24' : 'transparent',
                                                color: isSelected ? 'white' : '#1a1a1a',
                                                transition: "all 200ms ease",
                                                '&:hover': {
                                                    backgroundColor: isSelected ? '#C41B20' : '#f5f5f5'
                                                }
                                            }}
                                        >
                                            {
                                                applicant?.candidateId?.userId?.avatar ?
                                                    <Avatar src={applicant?.candidateId?.userId?.avatar} />
                                                    :
                                                    <Avatar sx={{
                                                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                                                        color: isSelected ? 'white' : '#666'
                                                    }}>
                                                        {`${applicant?.name?.[0]} ${applicant?.surname?.[0]}`}
                                                    </Avatar>
                                            }
                                            <Typography marginLeft={2}>
                                                {`${applicant?.name} ${applicant?.surname}`}
                                            </Typography>
                                        </Box>
                                    )
                                })}
                            </Stack>
                        </Box>
                        <div className="flex gap-4 items-center justify-center mt-4">
                            <IconButton disabled={applicantPage <= 0} onClick={() => setApplicantPage(prev => prev - 1)}>
                                <ChevronLeftIcon />
                            </IconButton>
                            <IconButton disabled={(applicantPage + 1) === jobApplicants?.data?.totalPage} onClick={() => setApplicantPage(prev => prev + 1)}>
                                <ChevronRightIcon />
                            </IconButton>
                        </div>
                    </div>


                    <Box flexGrow={1} sx={{ pl: 3 }}>
                        {
                            candidateEvaluations.length === 0 ?
                                <Alert severity="warning">
                                    {t("noEvaluationFound")}
                                </Alert>
                                :
                                candidateId
                                    ? (
                                        <Paginate
                                            count={candidateEvaluationsQuery?.data?.count || 0}
                                            isFetching={candidateEvaluationsQuery?.isLoading}
                                            pageSizes={pageSizes}
                                        >
                                            <EvaluatedCandidate
                                                data={candidateEvaluations}
                                            />
                                        </Paginate>
                                    )
                                    : (
                                        <Alert severity="warning">
                                            {t("selectCandidateToViewEvaluations")}
                                        </Alert>
                                    )
                        }
                    </Box>
                </Stack>
            }
        </Container>
    )
}

Component.displayName = 'Evaluated';
