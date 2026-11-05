import { ExpandMoreOutlined, InfoOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  List,
  ListItem,
  SvgIcon,
  Typography,
} from '@mui/material';
import type { ApplicantAnswer, ApplicantForm } from '../../../CandidateApplicantDetail';
import QuestionAnswerList from './AppliedJobs/QuestionAnswerList';
import { useTranslation } from 'react-i18next';

export default function ApplicantAnswers({
  questions,
  answers,
}: {
  questions: ApplicantForm[];
  answers: ApplicantAnswer[];
}) {
  const { t } = useTranslation();
  return (
    <Accordion className="!shadow-none border">
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div className="flex items-center gap-x-2">
          <SvgIcon
            fontSize="small"
            color="action"
          >
            <InfoOutlined />
          </SvgIcon>
          <Typography variant="subtitle1">{t('applicantAnswers')}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <QuestionAnswerList
          questions={questions}
          answers={answers}
        />
      </AccordionDetails>
    </Accordion>
  );
}
