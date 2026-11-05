import { MenuItem, TextField } from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { CandidateEvaluationPayload } from "src/types";
import { EvaluationTemplate } from "src/types/EvaluationTemplate";

export default function SelectTemplate({ items }: { items: EvaluationTemplate[] }) {
    const { t } = useTranslation()
    const { values, handleBlur, touched, errors, resetForm, setFieldValue } = useFormikContext<CandidateEvaluationPayload>()

    return (
        <TextField
            fullWidth
            label={t("selectTemplate")}
            name="evaluationTemplateId"
            onChange={(e) => {
                resetForm()
                setFieldValue('evaluationTemplateId', e.target.value)
            }}
            value={values.evaluationTemplateId ?? ''}
            size="medium"
            variant="outlined"
            onBlur={handleBlur}
            error={touched.evaluationTemplateId && !!errors.evaluationTemplateId}
            helperText={touched.evaluationTemplateId && errors.evaluationTemplateId}
            required
            select
        >
            {items?.map((item, ind) => (
                <MenuItem
                    key={item._id}
                    value={item._id}
                >
                    {item.title}
                </MenuItem>
            ))}
        </TextField>
    )
}
