import { Alert, Button, Divider, IconButton } from "@mui/material"
import { CreateScoreCard } from "."
import { useFormikContext } from "formik"
import { EvaluationScoreCard, EvaluationTemplatePayload } from "src/types/EvaluationTemplate"
import { Add, DeleteOutline, KeyboardArrowDown, KeyboardArrowUp, ThumbDown, ThumbUp, ThumbsUpDown } from "@mui/icons-material"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowDown01Icon, ArrowUp01Icon, Delete01Icon } from "hugeicons-react"

export default function ScoreCards() {
    const [isOpenCreateForm, setOpenCreateForm] = useState(false)
    const { values } = useFormikContext<EvaluationTemplatePayload>()
    const { t } = useTranslation()

    return (
        <>
            <div className='border-2 rounded-[13px] w-full mx-auto'>
                <p className='px-2 py-2 bg-gray-100 text-sm text-[#5E5E5E]'>{t('scoreCard')}</p>
                <Divider sx={{ borderColor: 'lightgray' }} />
                <div className="p-4">
                    {values.scoreCards?.length === 0 ? <Alert severity="info">{t('thereAreNoScoreCardsYet')}</Alert> :
                        values.scoreCards?.map((scoreCard, index) => {
                            return (
                                <ScoreCard
                                    key={index + "-card"}
                                    cardIndex={index}
                                    scoreCard={scoreCard}
                                />
                            )
                        })}
                    <CreateScoreCard
                        isVisible={isOpenCreateForm}
                        setVisible={setOpenCreateForm}
                    />
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <Button
                    startIcon={<Add />}
                    onClick={() => setOpenCreateForm(true)}
                    disabled={isOpenCreateForm}
                >
                    {t('addScoreCard')}
                </Button>
            </div>
        </>
    )
}

function ScoreCard({ scoreCard, cardIndex }: { scoreCard: EvaluationScoreCard, cardIndex: number }) {
    const { values, setFieldValue } = useFormikContext<EvaluationTemplatePayload>()

    const handleArrowClick = (direction: 'up' | 'down') => {
        const currentIndex = cardIndex;
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= values.scoreCards.length) return;

        const copyArr = [...values.scoreCards];
        const temp = copyArr[newIndex];
        copyArr[newIndex] = copyArr[currentIndex];
        copyArr[currentIndex] = temp;


        setTimeout(() => {
            copyArr[currentIndex] = temp;
            setFieldValue('scoreCards', copyArr);
        }, 50);
    };

    const handleDelete = () => {
        const copyArr = [...values.scoreCards]
        copyArr.splice(cardIndex, 1)
        setFieldValue('scoreCards', copyArr)
    }
    return (
        <div className='flex gap-2 items-center justify-between py-2 hover:bg-slate-50 rounded-[13px]'>
            <div className='flex gap-4 items-center'>
                <div className="min-w-[58px]">
                    <IconButton
                        onClick={() => handleArrowClick('down')}
                        sx={{
                            p: "2px",
                            "&:hover": {
                                backgroundColor: "transparent"
                            }
                        }}
                    >
                        <ArrowDown01Icon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleArrowClick('up')}
                        sx={{
                            p: "2px",
                            "&:hover": {
                                backgroundColor: "transparent"
                            }
                        }} >

                        <ArrowUp01Icon />
                    </IconButton>
                </div>
                <div>
                    <p className='font-semibold'>{scoreCard.title}</p>
                    <p className='text-sm'>{scoreCard?.description}</p>
                </div>
            </div>
            <div className='flex gap-2 text-gray-400'>
                <div className='flex pointer-events-none'>
                    <IconButton color='inherit'>
                        <ThumbDown fontSize='small' sx={{ p: "2px" }} />
                    </IconButton>
                    <IconButton color='inherit'>
                        <ThumbsUpDown sx={{ p: "2px" }} />
                    </IconButton>
                    <IconButton color='inherit'>
                        <ThumbUp fontSize='small' sx={{ p: "2px" }} />
                    </IconButton>
                    <IconButton color='inherit' sx={{ position: "relative" }}>
                        <>
                            <ThumbUp sx={{ position: "relative", left: 4, p: "2px" }} fontSize='small' />
                            <ThumbUp sx={{ position: "absolute", left: 0, p: "2px" }} fontSize='small' />
                        </>
                    </IconButton>
                </div>
                <div className='ml-4'>
                    <IconButton onClick={handleDelete} className='hover:text-red-400 duration-200'>
                        <Delete01Icon />
                    </IconButton>
                </div>
            </div>
        </div>
    )
}