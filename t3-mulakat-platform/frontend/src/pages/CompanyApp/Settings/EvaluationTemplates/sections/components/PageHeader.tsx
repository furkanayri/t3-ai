import { IconButton } from "@mui/material";
import { ArrowLeft01Icon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "src/components/shared";

export default function PageHeader({ mode, handleGoBack }: { mode: "create" | "edit", handleGoBack: () => void }) {
    const { t } = useTranslation()

    return (
        <div className='flex justify-between items-center w-full'>
            <div className='flex gap-1 justify-center items-center'>
                <IconButton onClick={handleGoBack}>
                    <ArrowLeft01Icon size={18} />
                </IconButton>
                <p className='text-sm text-[#5E5E5E]'>{t(mode === "create" ? t('createNewEvaluationTemplate') : t('editEvaluationTemplate'))}</p>
            </div>
            <CustomButton
                sx={{
                    backgroundColor: "#fff",
                    color: "#5E5E5E",
                    border: "1px solid #5E5E5E",
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
                type='submit'
            >
                {t('Save')}
            </CustomButton>
        </div>
    )
}
