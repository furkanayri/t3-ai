// src/pages/InformationCompanyPage.tsx
import React from 'react';
import { Box, Typography, Link, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const InformationCompanyPage = () => {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
          
            }}
        >
            <Card
                sx={{
                  
                    backgroundColor: 'grey.200', 
                    boxShadow: 1,
                }}
            >
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                        {t("CareerInformationPage")}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
                      {t("IfWantCareerPage")}
                        {t("ThisCareerPage")}{' '}
                        <Link href="https://jobs.heplin.com" target="_blank" rel="noopener noreferrer">
                            jobs.heplin.com
                        </Link>{' '}
                        {t("SpesificYourPage")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                        {t("Contact")}: info@heplin.com
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default InformationCompanyPage;
