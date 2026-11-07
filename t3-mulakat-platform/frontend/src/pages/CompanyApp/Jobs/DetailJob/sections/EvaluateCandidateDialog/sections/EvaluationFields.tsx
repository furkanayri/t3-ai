import { Alert, TextField, Typography } from "@mui/material"
import { useFormikContext } from "formik"
import { useEffect } from "react"
import { CandidateEvaluationPayload } from "src/types"
import { type EvaluationField as Field } from "src/types/EvaluationTemplate"

export default function EvaluationFields({ fields }: { fields: Field[] }) {
    const { values, setFieldValue } = useFormikContext<CandidateEvaluationPayload>()
    useEffect(() => {
        const allFieldsFilled = fields.every(field => {
            const fieldData = values.fields.find(f => f.fieldId === field._id);
            return fieldData && fieldData.answer && fieldData.answer.trim() !== '';
        });


        setFieldValue('allFieldsFilled', allFieldsFilled);
    }, [values.fields, fields, setFieldValue]);


    return (
        <div className='border-2 rounded w-full mx-auto'>
            <p className='px-4 py-4 bg-gray-100 font-semibold'>Questions</p>
            {fields.length === 0 ? <Alert severity="info">There are no questions yet</Alert> :
                fields.map((field) => (
                    <div key={field._id} className='px-4 py-2'>
                        <Typography>{field.title}</Typography>
                        <TextField
                            fullWidth
                            value={values.fields.find(f => f.fieldId === field._id)?.answer ?? ''}
                            onChange={(e) => {
                                const updatedFields = [...values.fields.filter(f => f.fieldId !== field._id), { fieldId: field._id, answer: e.target.value }];
                                setFieldValue('fields', updatedFields);
                            }}
                            placeholder={field.description ?? ''}
                            sx={{ flexGrow: 1 }}
                            hiddenLabel
                            multiline
                            rows={4}
                        />
                    </div>
                ))
            }
        </div>
    )
}
