import React from 'react'
import { Card, CardContent, IconButton, Theme, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ApplicantMatchingRateChip from './ApplicantMatchingRateChip';
import { ThumbDown, ThumbUp, ThumbsUpDown } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
const EvaluatedCandidate = ({ data }: { data: any }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const { t } = useTranslation();

    const matches = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    return (
        <Card sx={{ minHeight: '300px', }} >
            <CardContent>
                <div>
                    <div className='flex items-center'>
                        <IconButton
                            sx={{ display: matches ? 'block' : "none" }}
                            onClick={() => setSearchParams(prev => {
                                prev.delete('applicant')
                                return prev
                            })}
                        >
                            <ArrowBackIosIcon />
                        </IconButton>
                        <Typography variant='h6'>{t("candidateEvaluations")}</Typography>
                    </div>
                    <div className='w-full'>
                        <div>
                            {data?.map((evaluation: any) => (
                                <div key={evaluation._id} className='p-4'>
                                    <Card sx={{ position: 'relative' }}>
                                        <div className='absolute right-5 top-5'>
                                            <div className='flex'>

                                                <ApplicantMatchingRateChip
                                                    rate={isNaN(+evaluation.score) ? 0 : +evaluation.score.toFixed(2)}
                                                />
                                            </div>
                                        </div>
                                        <CardContent>
                                            <div className='border-b-2 border-slate-300 mb-5'>
                                                <Typography>
                                                    <strong>{t("evaluationTemplate")}</strong>: {evaluation?.evaluationTemplateId?.title}
                                                </Typography>
                                                {evaluation?.evaluationTemplateId?.fields?.map((field: any) => (
                                                    <div key={field._id} className='flex flex-col my-4 gap-2'>
                                                        <div>
                                                            <Typography>
                                                                <strong>{t("Question")}</strong>: {field.title}
                                                            </Typography>
                                                        </div>
                                                        {evaluation?.fields
                                                            ?.filter((evaluationField: any) => evaluationField?.fieldId === field?._id)
                                                            .map((filteredField: any) => (
                                                                <div key={filteredField._id}>
                                                                    <Typography>{filteredField.answer}</Typography>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <Typography variant='h5'>{t("scoreCards")}</Typography>
                                                {
                                                    evaluation?.evaluationTemplateId?.scoreCards.map((scoreCard: any, index: number) => (
                                                        <div key={scoreCard?._id} className='flex items-center justify-between'>
                                                            <Typography fontWeight={500}>{index + 1}. {scoreCard.title}</Typography>
                                                            {evaluation?.scoreCard
                                                                ?.filter((score: any) => score?.itemId === scoreCard?._id)
                                                                ?.map((filteredScore: any) => (
                                                                    <div key={filteredScore._id}>
                                                                        <div className='flex gap-2 text-gray-400'>
                                                                            <Tooltip title={t("no")}>
                                                                                <IconButton color={filteredScore.score === 'no' ? 'warning' : 'inherit'}>
                                                                                    <ThumbDown fontSize='small' sx={{ p: "2px" }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title={t("not-sure")}>
                                                                                <IconButton color={filteredScore.score === 'not-sure' ? 'warning' : 'inherit'}>
                                                                                    <ThumbsUpDown sx={{ p: "2px" }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title={t("yes")}>
                                                                                <IconButton color={filteredScore.score === 'yes' ? 'primary' : 'inherit'}>
                                                                                    <ThumbUp fontSize='small' sx={{ p: "2px" }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title={t("strong-yes")}>
                                                                                <IconButton color={filteredScore.score === 'strong-yes' ? 'success' : 'inherit'} sx={{ position: "relative" }}>
                                                                                    <ThumbUp sx={{ position: "relative", left: 4, p: "2px" }} fontSize='small' />
                                                                                    <ThumbUp sx={{ position: "absolute", left: 0, p: "2px" }} fontSize='small' />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export default EvaluatedCandidate