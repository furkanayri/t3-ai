import { ArticleOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function CoverletterAccordion({ coverLetter }: { coverLetter?: null | string }) {
  const { t } = useTranslation();
  return (
    <Accordion className="!shadow-none border">
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
              <ArticleOutlined />
            </SvgIcon>
            <Typography
              variant="subtitle1"
              color="text.primary"
            >
              {t('coverLetter')}
            </Typography>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          whiteSpace="pre-line"
          variant="body2"
        >
          {coverLetter || <Chip label="Empty" />}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
