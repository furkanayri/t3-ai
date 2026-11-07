import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { CustomButton } from "src/components/shared";
import { useNewMail } from "src/providers";

export default function PageHeader() {
    const { t } = useTranslation()
    const { openNewMail } = useNewMail()
    return (
        <div className='flex justify-between mb-[30px]  z-50'>
            <p className='text-2xl font-medium'>{t('Mailbox')}</p>
            <CustomButton
                startIcon={<Add />}
                onClick={() => openNewMail()}
            >
                {t('New Email')}
            </CustomButton>
        </div>
    )
} 