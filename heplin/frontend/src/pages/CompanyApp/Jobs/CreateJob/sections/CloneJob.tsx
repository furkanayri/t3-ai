import { Autocomplete, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system';
import { useFormikContext } from 'formik';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useGetAllJobsQuery } from 'src/hooks/useServices';
import { Quotas } from 'src/types/Quotas';
import { array } from 'src/utils';

export default function CloneJob({ quatas }: { quatas: Quotas }) {
    const { t } = useTranslation();
    const [jobOffical, setJobOffical] = useState<any>()
    const jobsQuery = useGetAllJobsQuery();
    const jobs = array(jobsQuery?.data?.results)
    const { resetForm } = useFormikContext()
    const handleSetJobValues = () => {
        const newInitialValues = {
            title: jobOffical.title ?? '',
            categoryId: jobOffical.categoryId ?? '',
            jobType: jobOffical.jobType ?? '',
            locationType: jobOffical.locationType ?? '',
            country: jobOffical.country ?? '',
            city: jobOffical.city ?? '',
            district: jobOffical.district ?? '',
            content: jobOffical.content ?? '',
            requirements: jobOffical.requirements ?? '',
            recruitmentStageId: jobOffical.recruitmentStageId ?? '',
            endDate: new Date(jobOffical?.endDate) ?? new Date(),
            applicantForm: jobOffical.applicantForm ?? [],
            hiringTeams: jobOffical.hiringTeams ?? [],
            skills: jobOffical.skills ?? [],
            fields: [
                { type: 'name_surname', isRequired: true, isVisible: true },
                { type: 'email', isRequired: true, isVisible: true },
                { type: 'phone', isRequired: true, isVisible: true },
                { type: 'cv', isRequired: true, isVisible: true },
                {
                    type: 'coverLetter',
                    isRequired: false,
                    isVisible: true,
                },
                {
                    type: 'currentCompany',
                    isRequired: false,
                    isVisible: true,
                },
            ],
            seoTitle: jobOffical.seoTitle ?? '',
            seoDescription: jobOffical.seoDescription ?? '',
            aiInterview: (!quatas?.aiFeatures?.interview?.isActive || quatas?.aiFeatures?.evaluation?.remainingCount <= 0) ? 'no' : jobOffical?.aiInterview ?? 'no',

        };
        resetForm({ values: newInitialValues })
    }


    return (
        <>
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            item
                            xs={12}
                            md={4}
                        >
                            <Typography variant="h6">{t('copyJob')}</Typography>
                            <Typography
                                mt={2}
                                color="text.secondary"
                                variant="body2"
                            >
                                {t('copyJobDescription')}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={8}
                        >
                            <Stack spacing={3}>
                                <div className='flex gap-4 w-full items-center'>
                                    <div className='w-full'>
                                        <Autocomplete
                                            fullWidth
                                            disablePortal
                                            options={jobs}
                                            value={jobOffical || null}
                                            onChange={(event, value: any) => setJobOffical(value)}
                                            isOptionEqualToValue={(option, value) => option.title === value.title}
                                            getOptionLabel={(option) => option.title || ''}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    hiddenLabel
                                                    placeholder={t("selectJob")}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Button onClick={handleSetJobValues} disabled={!jobOffical} variant='contained'>{t('copy')}</Button>
                                    </div>
                                </div>
                                <div>
                                    {jobOffical && <span className='text-red-500 font-bold'>{t('reviewCloneJob')}</span>}
                                </div>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}
