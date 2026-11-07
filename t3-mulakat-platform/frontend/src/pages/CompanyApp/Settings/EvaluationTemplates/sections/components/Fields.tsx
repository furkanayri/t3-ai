import { Add, DeleteOutline, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Alert, Button, Divider, IconButton } from "@mui/material";
import { useFormikContext } from "formik";
import { useState } from "react";
import { EvaluationField, EvaluationTemplatePayload } from "src/types/EvaluationTemplate";
import CreateField from "./CreateField";
import { useTranslation } from "react-i18next";
import { ArrowDown01Icon, ArrowUp01Icon, Delete01Icon } from "hugeicons-react";

export default function Fields() {
    const [isOpenCreateForm, setOpenCreateForm] = useState(false)
    const { values } = useFormikContext<EvaluationTemplatePayload>()
    const { t } = useTranslation()

    return (
        <>
            <div className='border-2 rounded-[13px] w-full'>
                <p className='px-2 py-2 bg-gray-100 text-sm text-[#5E5E5E]'>{t('Questions')}</p>
                <Divider sx={{ borderColor: 'lightgray' }} />
                <div className='p-4 space-y-4'>
                    {values.fields?.length === 0 ? <Alert severity="info">{t('thereAreNoQuestionsYet')}</Alert> :
                        values.fields?.map((field, index) => {
                            return (
                                <Field
                                    key={index + "-card"}
                                    fieldIndex={index}
                                    field={field}
                                />
                            )
                        })}
                    <CreateField
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
                    {t('addQuestion')}
                </Button>
            </div>
        </>
    )
}

function Field({ field, fieldIndex }: { field: EvaluationField, fieldIndex: number }) {
    const { values, setFieldValue } = useFormikContext<EvaluationTemplatePayload>()

    const handleArrowClick = (direction: 'up' | 'down') => {
        const currentIndex = fieldIndex;
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= values.fields.length) return;

        const copyArr = [...values.fields];
        const temp = copyArr[newIndex];
        copyArr[newIndex] = copyArr[currentIndex];
        copyArr[currentIndex] = temp;

        setTimeout(() => {
            copyArr[currentIndex] = temp;
            setFieldValue('fields', copyArr)
        }, 50);
    };
    const handleDelete = () => {
        const copyArr = [...values.fields]
        copyArr.splice(fieldIndex, 1)
        setFieldValue('fields', copyArr)
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
                        }}
                    >
                        <ArrowUp01Icon />
                    </IconButton>
                </div>
                <div>
                    <p className='font-semibold'>{field.title}</p>
                    <p className='text-sm'>{field?.description}</p>
                </div>
            </div>
            <div className='flex gap-2 text-gray-400'>
                <div className='pl-2'>
                    <IconButton onClick={handleDelete} className='hover:text-red-400 duration-200' >
                        <Delete01Icon />
                    </IconButton>
                </div>
            </div>
        </div>
    )
}