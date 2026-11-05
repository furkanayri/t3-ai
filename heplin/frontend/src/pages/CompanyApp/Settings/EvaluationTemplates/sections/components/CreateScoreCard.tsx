import { Cancel, Clear, Done } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import { useFormikContext } from "formik";
import { Cancel01Icon, Tick01Icon } from "hugeicons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { EvaluationScoreCard, EvaluationTemplatePayload } from "src/types/EvaluationTemplate";

export default function CreateScoreCard({ isVisible, setVisible }: { isVisible: boolean, setVisible: Dispatch<SetStateAction<boolean>> }) {
    const { t } = useTranslation()
    const { setFieldValue, values } = useFormikContext<EvaluationTemplatePayload>()
    const [card, setCard] = useState<EvaluationScoreCard>({ title: "", description: "" })
    const [error, setError] = useState("")

    const handleCreate = () => {
        if (!card.title) {
            setError("*Title is required")
            return
        }
        setFieldValue('scoreCards', [...values.scoreCards, card])
    }

    const handleClose = () => {
        setVisible(false)
    }
    return (
        isVisible ?
            <div className="flex pt-2">
                <div className="grow space-y-2 relative">
                    <TextField
                        fullWidth
                        label={t("scoreCardTitle")}
                        onChange={(e: any) => {
                            if (!!error) setError("")
                            setCard(pre => ({ ...pre, title: e.target.value }))
                        }}
                        size="small"
                        required
                        inputProps={{ maxLength: 80 }}
                    />
                    {!!error ? <p className="text-end text-red-500 text-xs absolute pt-1 top-0 right-2">{error}</p> : null}
                    <TextField
                        fullWidth
                        label={t("descriptionOptional")}
                        onChange={(e: any) => setCard(pre => ({ ...pre, description: e.target.value }))}
                        size="small"
                        inputProps={{ maxLength: 180 }}
                        multiline
                        rows={2}
                    />
                </div>
                <div className="ml-4 flex flex-col ">
                    <IconButton onClick={handleCreate} className='hover:text-green-400 duration-200'>
                        <Tick01Icon />
                    </IconButton>
                    <IconButton onClick={handleClose} className='hover:text-red-400 duration-200'>
                        <Cancel01Icon size={20} />
                    </IconButton>
                </div>
                <div>

                </div>
            </div>
            : null
    )
}
