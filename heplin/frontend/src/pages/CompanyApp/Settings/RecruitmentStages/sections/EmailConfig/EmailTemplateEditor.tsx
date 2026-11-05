import React, { useRef, useEffect } from 'react';
import { Button, Chip, TextField, Typography } from "@mui/material";
import { QuillEditor } from "src/components/quill-editor";
import { useFormikContext } from "formik";
import { Candidate, Employee, RecruitmentEmailConfigPayload, RecruitmentStageStep, Tenant } from "src/types";
import { useTranslation } from 'react-i18next';
import { JobPost } from 'src/types/jobPost';

const EmailTemplateEditor = ({ name }: { name: keyof RecruitmentEmailConfigPayload }) => {
    const { t } = useTranslation()
    const { values, setFieldValue, handleChange, handleBlur, setFieldTouched, touched, errors } = useFormikContext<RecruitmentEmailConfigPayload>();
    const quillRef = useRef<any>(null);

    const candidateFields: Array<keyof Candidate> = ["name", "surname", "email", "phone"]
    const companyFields: Array<keyof Tenant> = ["name", "legalName", "email", "phone", "website", "address"]
    const jobFields: Array<keyof JobPost> = ["title", "jobType", "locationType"]
    const employeeFields: Array<keyof Employee> = ["name", "surname", "email"]
    const fields = [
        { title: t("Job"), name: 'job', items: jobFields },
        { title: t("Candidate"), name: 'candidate', items: candidateFields },
        { title: t("Company"), name: 'company', items: companyFields, },
        { title: t("Employee"), name: 'employee', items: employeeFields, },
    ]

    const handleInsertDynamicText = (text: string) => {
        const dynamicText: string = `{{${text}}}`;
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range) {
            editor.insertText(range.index, dynamicText);
            setFieldValue(name, editor.root.innerHTML);
        }
    };

    return (
        <div className='space-y-5'>
            <TextField
                label={t('email_title')}
                name="title"
                onChange={handleChange}
                value={values.title ?? ''}
                onBlur={handleBlur}
                error={touched.title && !!errors.title}
                helperText={touched.title && errors.title}
                fullWidth
            />
            <QuillEditor
                ref={quillRef}
                onChange={(html) => setFieldValue(name, html)}
                value={values[name] as string}
                placeholder={t('writeSomething')}
                onBlur={() => setFieldTouched(name, true)}
                sx={{ minHeight: 400 }}
            />
            {touched[name] && errors[name] ? (
                <Typography
                    variant="body2"
                    color="red"
                >
                    {errors[name]}
                </Typography>
            ) : null}

            <div className='space-y-3'>
                {fields.map((field, ind) => {
                    return (
                        <div className='flex gap-2' key={ind + field.name}>
                            <Typography minWidth={100}>{field.title}:</Typography>
                            {field.items.map((text, i) => (
                                <Chip
                                    key={i + text + field.name}
                                    size='small'
                                    label={text}
                                    onClick={() => handleInsertDynamicText(`${field.name}.${text}`)}
                                    sx={{ borderRadius: .5 }}
                                />
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
export default EmailTemplateEditor;
