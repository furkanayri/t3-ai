import { AttachFileOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, IconButton, SvgIcon, Tooltip, Typography } from '@mui/material';
import { EyeIcon, Link01Icon, ViewOffIcon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';
import { DownloadCVButton, PDFViewer } from 'src/components';
import { API_BASE_URL } from 'src/constants';
import { convertPublicFileURL } from 'src/utils';
import { useCandidateDetail } from '../../../CandidateApplicantDetail';

import store from 'store';
import { useParams } from 'react-router';
import { useState } from 'react';

export default function CvViewer({ jobId, fileId, userInfo }: { jobId: any, fileId: string, userInfo: string }) {
  const { t } = useTranslation();
  const { handleSwitchChange, isSeen } = useCandidateDetail();
  const handleSeen = () => (event: any, isExpanded: any) => {
    if (!isSeen && isExpanded) {
      handleSwitchChange()
    }
  }
  return (
    <Accordion onChange={handleSeen()} className="!shadow-none border ">
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div className="flex items-center justify-between gap-x-2 flex-1 pr-4">
          <div className="flex items-center gap-x-2">
            <SvgIcon
              fontSize="small"
              color="action"
            >
              <AttachFileOutlined />
            </SvgIcon>
            <Typography variant="subtitle1">{t('cvFile')}</Typography>
          </div>
          <div>

            {/* <IconButton onClick={e => {
              e.stopPropagation()
              window.open(`${API_BASE_URL}/v1/upload/cv/${fileId}`, '_blank')
            }}>
              <Link01Icon size={18} />
            </IconButton> */}

            <Tooltip title={isSeen ? t('seen') : t('unSeen')}>
              <IconButton onClick={(e) => {
                e.stopPropagation()
                handleSwitchChange()
              }
              }>
                {
                  isSeen ?
                    <EyeIcon size={18} /> :
                    <ViewOffIcon size={18} />
                }
              </IconButton>
            </Tooltip>

            <DownloadCVButton
              id={fileId}
              fileName={`${userInfo.split(' ').join('_').toLocaleUpperCase()}_CV.pdf`}
            />
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails >
        <PDFViewer fileUrl={`${API_BASE_URL}/v1/upload/cv/${fileId}`} />
      </AccordionDetails>
    </Accordion>
  );
}
