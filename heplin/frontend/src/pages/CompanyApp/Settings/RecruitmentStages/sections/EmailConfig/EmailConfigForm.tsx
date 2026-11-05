import { FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, Switch, Typography } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { RecruitmentEmailConfigPayload } from "src/types";
import { useTranslation } from 'react-i18next';

export default function EmailConfigForm() {
    const { t } = useTranslation();
    const { values, handleChange } = useFormikContext<RecruitmentEmailConfigPayload>();

    return (
        <>
            <div> 
                <FormLabel sx={{ marginBottom: 2 }}>{t('activate_email')}</FormLabel>
                <FormGroup>
                    <Field
                        as={Switch} 
                        type="checkbox"
                        name="isEmailsActive"
                        checked={values.isEmailsActive}
                        onChange={handleChange}
                    />
                </FormGroup>
            </div>
            <div>
                <FormControl disabled={!values.isEmailsActive}>
                    <FormLabel sx={{ marginBottom: 2 }}>{t('email_configuration')}</FormLabel>
                    <Typography variant="subtitle1">{t('after_step_passed')},</Typography>
                    <Field as={RadioGroup} name="emailFlow">
                        <FormControlLabel value="auto" control={<Radio />} label={t('automatic_email_with_approve')} />
                        <FormControlLabel value="manual" control={<Radio />} label={t('manuel_email_with_changes')} />
                    </Field>
                </FormControl>
            </div>
        </>
    )
}