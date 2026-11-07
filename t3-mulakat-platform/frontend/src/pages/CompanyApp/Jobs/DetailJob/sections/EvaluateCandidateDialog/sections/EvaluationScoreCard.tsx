import { ThumbDown, ThumbUp, ThumbsUpDown } from "@mui/icons-material"
import { Alert, IconButton, Tooltip } from "@mui/material"
import { blue, green, orange, red } from "@mui/material/colors"
import { useFormikContext } from "formik"
import { t } from "i18next"
import { CandidateEvaluationPayload, CandidateEvaluationScoreType } from "src/types"
import { type EvaluationScoreCard as ScoreCard } from "src/types/EvaluationTemplate"

export default function EvaluationScoreCard({ scoreCards }: { scoreCards: ScoreCard[] }) {
    const { values, setFieldValue } = useFormikContext<CandidateEvaluationPayload>();

    const handleScoreClick = (itemId: string | undefined, score: CandidateEvaluationScoreType) => {
        const newScore = { itemId, score }

        const rest = values?.scoreCard?.filter(item => item.itemId !== itemId)

        const newScoreCard = [...rest, newScore]
        setFieldValue('scoreCard', newScoreCard)


        if (newScoreCard.length === scoreCards.length) {
            setFieldValue('allScoreCardsFilled', true);
        } else {
            setFieldValue('allScoreCardsFilled', false);
        }

    }
    return (
        <div className='border-2 rounded w-full mx-auto'>
            <p className='px-4 py-4 bg-gray-100 font-semibold'> {t('scoreCard')} </p>
            {scoreCards?.length === 0 ? <Alert severity="info">{t('thereAreNoScoreCardsYet')}</Alert> :
                scoreCards?.map((scoreCard, index) => {

                    const currentScore = values.scoreCard?.find(item => item?.itemId === scoreCard._id)

                    return (
                        <div className='flex gap-2 items-center justify-between px-4 py-2'>
                            <div>
                                <p className='font-semibold'>{scoreCard.title}</p>
                                <p className='text-sm'>{scoreCard?.description}</p>
                            </div>
                            <div className='flex text-gray-400'>
                                <Tooltip placement="top" title={t('No')}>
                                    <IconButton
                                        onClick={() => handleScoreClick(scoreCard?._id!, "no")}
                                        sx={{
                                            position: "relative",
                                            transitionDuration: 200,
                                            color: !!currentScore && currentScore.score === 'no' ? red[300] : 'inherit',
                                            '&:hover': {
                                                color: red[200]
                                            }
                                        }}
                                    >
                                        <ThumbDown fontSize='small' sx={{ p: "2px" }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip placement="top" title={t('not-sure')}>
                                    <IconButton
                                        onClick={() => handleScoreClick(scoreCard?._id!, "not-sure")}
                                        sx={{
                                            position: "relative",
                                            transitionDuration: 200,
                                            color: !!currentScore && currentScore.score === 'not-sure' ? orange[300] : 'inherit',
                                            '&:hover': {
                                                color: orange[200]
                                            }
                                        }}
                                    >
                                        <ThumbsUpDown sx={{ p: "2px" }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip placement="top" title={t('yes')}>
                                    <IconButton
                                        onClick={() => handleScoreClick(scoreCard?._id!, "yes")}
                                        sx={{
                                            position: "relative",
                                            transitionDuration: 200,
                                            color: !!currentScore && currentScore.score === 'yes' ? blue[300] : 'inherit',
                                            '&:hover': {
                                                color: blue[200]
                                            }
                                        }}
                                    >
                                        <ThumbUp fontSize='small' sx={{ p: "2px" }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip placement="top" title={t('strong-yes')}>
                                    <IconButton
                                        onClick={() => handleScoreClick(scoreCard?._id!, "strong-yes")}
                                        sx={{
                                            position: "relative",
                                            transitionDuration: 200,
                                            color: !!currentScore && currentScore.score === 'strong-yes' ? green[300] : 'inherit',
                                            '&:hover': {
                                                color: green[200]
                                            }
                                        }}
                                    >
                                        <>
                                            <ThumbUp sx={{ position: "relative", left: 4, p: "2px" }} fontSize='small' />
                                            <ThumbUp sx={{ position: "absolute", left: 0, p: "2px" }} fontSize='small' />
                                        </>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    )
                })}
        </div>
    )
}
