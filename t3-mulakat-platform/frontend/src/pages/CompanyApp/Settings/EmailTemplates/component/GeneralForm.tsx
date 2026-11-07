import { TextField } from '@mui/material'
import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { EmailTemplate } from 'src/types'

const GeneralForm = () => {
    const { t } = useTranslation()
    const { handleChange, values } = useFormikContext<EmailTemplate>()
    return (
        <div>
            <div className='flex gap-4 flex-col'>
                <TextField
                    fullWidth
                    label={t("title")}
                    name="title"
                    size="medium"
                    variant="outlined"
                    required
                    value={values?.title}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    label={t("description")}
                    name="description"
                    size="medium"
                    variant="outlined"
                    rows={3}
                    multiline
                    value={values?.description}
                    onChange={handleChange}
                    required
                />
                <p className='text-sm text-[#5E5E5E] pt-[10px] pb-1'>{t("emailInformation")}</p>
                <TextField
                    fullWidth
                    label={t("subject")}
                    name="subject"
                    size="medium"
                    variant="outlined"
                    required
                    value={values?.subject}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    label={t("emailMessage")}
                    name="message"
                    size="medium"
                    variant="outlined"
                    required
                    multiline
                    rows={12}
                    value={values?.message}
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}

export default GeneralForm