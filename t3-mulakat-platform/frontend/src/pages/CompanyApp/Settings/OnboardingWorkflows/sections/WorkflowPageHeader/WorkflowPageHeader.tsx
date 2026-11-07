import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CustomButton } from 'src/components/shared';

export default function WorkflowPageHeader({ openCreate, createButtonVisible = false }: {
    createButtonVisible?: boolean,
    openCreate?: () => void,
}) {
    const { t } = useTranslation();

    return (
        <div className='flex justify-between mb-3'>
            <p className="text-[20px] text-[#5E5E5E] font-medium">
                {t('onboarding_workflows')}
            </p>
            {createButtonVisible && (
                <div>
                    <CustomButton
                        onClick={openCreate}
                        startIcon={<Add />}
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
                        {t("createNew")}
                    </CustomButton>
                </div>
            )}
        </div>
    );
}
