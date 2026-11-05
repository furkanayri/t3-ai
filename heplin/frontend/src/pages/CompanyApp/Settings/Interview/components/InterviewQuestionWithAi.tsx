import { Autocomplete, Button, CircularProgress, TextField } from '@mui/material';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ConfirmAction } from 'src/components/shared';

export const InterviewQuestionWithAi = ({ onClick, loading }: { loading: boolean, onClick: (prompt: string, numberOfQuestions: string, lang: string) => void }) => {
    const { t } = useTranslation();
    const [questionNumber, setQuestionNumber] = useState('3')
    const [lang, setLang] = useState('')
    const [prompt, setPrompt] = useState('')
    const options = [
        { label: "TR", value: "tr" },
        { label: "EN", value: "en" },

    ];
    return (
        <div className='flex items-center gap-2 '>
            <TextField
                fullWidth
                sx={{ width: 848 }}
                value={prompt}
                label={t('createInterviewQuestionWithAi')}
                onChange={(e: any) => setPrompt(e.target.value)}
                size="small"
                required
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
                        onClick(prompt, questionNumber, lang)
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Button size='small' disabled={!prompt} variant='outlined'>
                            {t('create')}
                        </Button>
                    )}
                </ConfirmAction>
            </div>

        </div>
    )
}

