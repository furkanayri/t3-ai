import React, { useState, useCallback } from 'react';
import { IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { Seo } from 'src/components/seo';
import { useTranslation } from 'react-i18next';
import { BulkCvUploadPage } from './sections/BulkCVUploadPage';
import { CreateArchiveJobPage } from './sections/CreateArchiveJobPage';
import { ListArchiveJobPage } from './sections/ListArchiveJobPage';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';




const tabs = [
    { label: "ArchiveJobPost", value: "archiveJob" },
    { label: "BulkCVUpload", value: "cvUpload" },
    { label: "ArchiveJobs", value: "openArchiveJob" },
];

export const Component = () => {
    const { t } = useTranslation();
    const [currentTab, setCurrentTab] = useState<"archiveJob" | "cvUpload" | "openArchiveJob">("archiveJob");

    const handleTabsChange = useCallback((event: React.SyntheticEvent, value: string) => {
        setCurrentTab(value as "archiveJob" | "cvUpload" | "openArchiveJob");
    }, []);


    return (
        <>

            <Seo title="Job Management" />
            <div className="pr-[55px]">
                <div className="flex items-center gap-2 mb-[20px]">
                    <p className="text-2xl font-medium">{t('Toplu CV İşlemleri ve Takipleri')}</p>
                    <Tooltip
                        arrow
                        title={
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>{t("createArchiveJobContent")}</li>
                                <li>{t("uploadCvAndApplicationContent")}</li>
                                <li>{t("resultsAndApplicantsContent")} </li>
                            </ul>
                        }
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    maxWidth: '800px',
                                },
                            },
                        }}
                    >
                        <IconButton size="small">
                            <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>

                <Tabs
                    onChange={handleTabsChange}
                    value={currentTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .Mui-selected": { color: "#E31E24!important" },
                        "& .MuiTabs-indicator": { backgroundColor: "#E31E24" },
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={t(tab.label)}
                            value={tab.value}
                            sx={{ color: "#141B34" }}
                        />
                    ))}
                </Tabs>

                <div className="mt-[20px]" style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}>
                    {currentTab === "archiveJob" && <CreateArchiveJobPage />}
                    {currentTab === "cvUpload" && <BulkCvUploadPage />}
                    {currentTab === "openArchiveJob" && <ListArchiveJobPage />}
                </div>
            </div>
        </>
    );
};

Component.displayName = 'JobManagementPage';
