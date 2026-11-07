import { TextField } from '@mui/material'
import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { EmailTemplate } from 'src/types'
import { DisqualifyMail } from 'src/types/Disqualify'

const GeneralForm = () => {
    const { t } = useTranslation()
    const { handleChange, values } = useFormikContext<DisqualifyMail>()
    return (
        <div>
            <div className='flex gap-4 flex-col'>
        
                <TextField
                    fullWidth
                    label={t("description")}
                    name="description"
                    size="medium"
                    variant="outlined"
                    rows={5}
                    multiline
                    value={values?.description}
                    onChange={handleChange}
                    required
                />
        
            </div>
        </div>
    )
}

export default GeneralForm