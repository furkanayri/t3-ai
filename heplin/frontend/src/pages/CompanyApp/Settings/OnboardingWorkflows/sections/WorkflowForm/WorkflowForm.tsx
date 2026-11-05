import { IconButton, TextField } from "@mui/material";
import { Formik, FormikHelpers } from "formik";
import { useTranslation } from "react-i18next";
import { CustomButton } from "src/components/shared";
import ChecklistForm from "./ChecklistForm";
import { ReactNode } from "react";
import { ArrowLeft01Icon } from "hugeicons-react";


export default function WorkflowForm({ goBack, header, onSubmit, initialValues }: {
    goBack: () => void,
    header: {
        title: ReactNode,
        actionText: string,
    },
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void,
    initialValues?: any
}) {
    const { t } = useTranslation();

    return <Formik
        onSubmit={onSubmit}
        enableReinitialize
        initialValues={initialValues || { title: '', description: '', items: [] }}
    >
        {
            ({ values, handleSubmit, isSubmitting, handleChange }) => (
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-2 p-[22px] rounded-[13px] mt-[20px]'
                        style={{
                            boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                        }}
                    >
                        <header className="flex items-center justify-between">
                            <div className='flex gap-1 justify-center items-center'>
                                <IconButton onClick={goBack}>
                                    <ArrowLeft01Icon size={18} />
                                </IconButton>
                                <p className="text-sm text-[#5E5E5E]'">
                                    {header.title}
                                </p>
                            </div>
                            <CustomButton
                                type="submit"
                                disabled={isSubmitting}
                                sx={{
                                    backgroundColor: "#fff",
                                    color: "#E31E24",
                                    border: "1px solid #E31E24",
                                    boxShadow: "none",
                                    px: "22px",
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    height: "30px",
                                    '&:hover': {
                                        backgroundColor: "#fff",
                                        boxShadow: "none"
                                    }
                                }}
                            >
                                {header.actionText}
                            </CustomButton>
                        </header>

                        <div className="flex mt-5">
                            <div className="w-1/3">
                                <p className="text-sm font-medium">
                                    {t('generalInfo')}
                                </p>
                            </div>
                            <div className="w-2/3 flex flex-col gap-4">
                                <TextField
                                    label={t('Title')}
                                    name="title"
                                    onChange={handleChange}
                                    value={values.title}
                                />
                                <TextField
                                    multiline
                                    minRows={2}
                                    label={t('description')}
                                    name="description"
                                    onChange={handleChange}
                                    value={values.description}
                                />
                            </div>
                        </div>

                        <div className="flex mt-5">
                            <div className="w-1/3">
                                <p className="text-sm font-medium">
                                    {t('Checklist')}
                                </p>
                            </div>
                            <div className="w-2/3 flex flex-col gap-2">
                                <ChecklistForm />
                            </div>
                        </div>
                    </div>
                </form>
            )
        }
    </Formik>
}