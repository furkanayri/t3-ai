import { Autocomplete, Button, CircularProgress, TextField } from '@mui/material';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ConfirmAction } from 'src/components/shared';
import { useGetAllJobsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';

export const InterviewQuestionWithjob = ({ onClick, loading }: { loading: boolean, onClick: (id: string, numberOfQuestions: string, lang: string) => void }) => {
    const { t } = useTranslation();
    const [jobOffical, setJobOffical] = useState<any>()
    const [questionNumber, setQuestionNumber] = useState('3')
    const [lang, setLang] = useState('')

    const jobsQuery = useGetAllJobsQuery()
    const jobs = array(jobsQuery?.data?.results)
    const options = [
        { label: "TR", value: "tr" },
        { label: "EN", value: "en" },

    ];
    return (
        <div className='flex items-center gap-2 '>
            <Autocomplete
                sx={{ width: 848 }}

                disablePortal
                size='small'
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
            <TextField
                label={t('numberOfQuestion')}
                type="number"
                sx={{ width: 150 }}

                value={questionNumber}
                onChange={(e: any) => setQuestionNumber(e.target.value)}
                size="small"
                inputProps={{ min: 3, max: 10 }}
                required
            />
            <Autocomplete
                options={options}
                sx={{ width: 120 }}
                size="small"
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue: any) => {
                    setLang(newValue?.value)
                }}
                renderInput={(params) => <TextField {...params} label={t('language')} />}
            />
            <div className='flex flex-grow justify-center'>


                <ConfirmAction
                    title={t('generatedQuestion')}
                    description={`${questionNumber} ${t('genderateQuestiondesc')}`}
                    onConfirm={async () => {
                        console.log('res');
                        onClick(jobOffical?._id, questionNumber, lang)
                        setJobOffical('')
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Button size='small' disabled={!jobOffical} variant='outlined'>
                            {t('create')}
                        </Button>
                    )}
                </ConfirmAction>
            </div>

        </div>
    )
}

