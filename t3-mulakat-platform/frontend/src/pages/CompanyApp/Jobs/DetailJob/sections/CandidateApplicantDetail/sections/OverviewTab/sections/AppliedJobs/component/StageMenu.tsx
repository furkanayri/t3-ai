import {
    Menu,
    MenuItem,
} from '@mui/material';
import { useGetRecruitmentStageDetailQuery } from 'src/hooks/useServices';
import { useDetailJob } from 'src/pages/CompanyApp/Jobs/DetailJob/DetailJobProvider';
import { useCandidateDetail } from '../../../../../CandidateApplicantDetail';



interface StageMenuProps {
    anchorEl: null | HTMLElement;
    setAnchorEl: (anchorEl: null | HTMLElement) => void;
    appliedJob: any
}

function StageMenu({ anchorEl, setAnchorEl, appliedJob }: StageMenuProps) {
    const open = Boolean(anchorEl);
    const { jobState, onCandidateMove } = useDetailJob()
    const { candidateState } = useCandidateDetail();

    const jobDetail = jobState?.data
    const recruitmentStageQuery = useGetRecruitmentStageDetailQuery(jobDetail?.recruitmentStageId)
    const steps = recruitmentStageQuery?.data?.recruitmentStage
    interface Step {
        _id: string;
        title: string;
        color: string;
    }
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeStage = (stageId: string) => {
        const currentRecruitmentStepId = appliedJob?.currentRecruitmentStepId
        const applicationId = appliedJob?._id
        let newStepId: any = {
            _id: stageId
        }
        onCandidateMove(newStepId, applicationId, stageId, appliedJob)

    }
    return (
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
        >
            {
                steps?.stepsSort?.map((step: Step) => {
                    return (
                        <MenuItem
                            disabled={appliedJob?.currentRecruitmentStepId?._id === step?._id}
                            key={step?._id}
                            onClick={() => handleChangeStage(step?._id)} >
                            {
                                step?.title
                            }
                        </MenuItem>

                    )
                })
            }
        </Menu>
    )
}
export default StageMenu