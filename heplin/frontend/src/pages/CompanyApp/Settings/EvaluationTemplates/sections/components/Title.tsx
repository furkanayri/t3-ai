import { TextField } from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { EvaluationTemplatePayload } from "src/types/EvaluationTemplate";

export default function Title() {
    const { t } = useTranslation()
    const { values, handleChange, handleBlur, touched, errors } = useFormikContext<EvaluationTemplatePayload>()
    return (
        <div className='space-y-4 w-full'>
            <TextField
                fullWidth
                label={t("Title")}
                name="title"
                onChange={handleChange}
                value={values.title ?? ''}
                size="medium"
                onBlur={handleBlur}
                error={touched.title && !!errors.title}
                helperText={touched.title && errors.title}
                required
                inputProps={{ maxLength: 50 }}
            />
        </div>
    )
}
