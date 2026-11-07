import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Chip,
    IconButton,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MoreVerticalCircle01Icon } from 'hugeicons-react';
import StageMenu from './StageMenu';
import CoverletterAccordion from '../../CoverLetterAccordion';
import CvViewer from '../../CvViewerAccordion';
import ApplicantAnswers from '../../ApplicantAnswers';


const AppliedJobAccordion = ({ appliedJobs, handleChange, employee, defaultExpanded }: { appliedJobs: any, handleChange: any, employee: any, defaultExpanded: boolean }) => {
    const { t } = useTranslation();
    const { id } = useParams()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget);
    };
    

    return (
        appliedJobs?.map((appliedJob: any) => {
            return (
                <div
                    key={appliedJob?._id}
                    className="border rounded-md border-zinc-100"
                >
                    <StageMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} appliedJob={appliedJob} />
                    <Accordion defaultExpanded={defaultExpanded} onChange={handleChange(appliedJob?.jobId?._id)}
                        className="!bg-slate-50">
                        <AccordionSummary>
                            <div className="flex items-center gap-x-4 flex-wrap">
                                <Typography variant="subtitle1">{appliedJob?.jobId?.title}</Typography>
                                <div className='flex items-center gap-1'>

                                    <Chip
                                        size="small"
                                        color={appliedJob?.status === 'disqualified' ? 'error' : undefined}
                                        label={appliedJob?.status === 'disqualified' ? t('Disqualified') : appliedJob?.currentRecruitmentStepId?.title}
                                    />
                                    {/* <IconButton onClick={(e) => handleClick(e)}>
                                        <MoreVerticalCircle01Icon size={18} />
                                    </IconButton> */}
                                </div>
                            </div>
                        </AccordionSummary>

                        <AccordionDetails>
                            <div className="space-y-2">
                                <CoverletterAccordion coverLetter={appliedJob.coverLetter} />
                                <CvViewer jobId={appliedJob?.jobId?._id} fileId={appliedJob?.cv?._id} userInfo={`${appliedJob?.name} ${appliedJob?.surname}`} />
                                <ApplicantAnswers
                                    answers={appliedJob?.applicantAnswers}
                                    questions={appliedJob?.jobId?.applicantForm}
                                />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>
            )
        })
    )
}

export default AppliedJobAccordion