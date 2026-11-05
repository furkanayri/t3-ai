import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Component as Account } from 'src/pages/AdminApp/Candidates/Edit/Account/Account'
export default function ProfileOverview() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleNext = () => {
        setSearchParams(prev => {
            prev.set("activeStep", "3")
            return prev
        })
    }

    const handlePrev = () => {
        setSearchParams(prev => {
            prev.set("activeStep", "1")
            return prev
        })
    }
    return (
        <div className="flex flex-col gap-4">
            <Account />
            <div className="flex justify-between">
                <Button
                    variant="outlined"
                    onClick={handlePrev}
                >
                    {t('back')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                >
                    {t('next')}
                </Button>
            </div>
        </div>
    )
}
