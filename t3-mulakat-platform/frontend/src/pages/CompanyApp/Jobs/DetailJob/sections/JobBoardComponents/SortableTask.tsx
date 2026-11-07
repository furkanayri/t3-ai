import { Box, Avatar, Typography, Tooltip, IconButton, Badge } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { indigo } from '@mui/material/colors';
import { format, intlFormatDistance, isValid } from 'date-fns';
import { Comment01Icon, EyeIcon, StarIcon } from 'hugeicons-react';
import { ApplicantMatchingRateChip } from '../../components';
import { MoreVertOutlined } from '@mui/icons-material';
import { useEffect } from 'react';

type SortableTaskProps = {
    application: any;
    stepId: string;
    latestSelected: string;
    activeCandidateId: string | null;
    employeeData: any;
    openApplicantDetail: (candidateId: string) => void;
    boardRoam: any;
    filteredApplicationsList: any[];
    index: number;
    setSearchParams: (callback: (prev: any) => any) => any;
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setDialogData: React.Dispatch<React.SetStateAction<any>>;
    handleStarClick: (application: any) => void;
};

export const SortableTask: React.FC<SortableTaskProps> = (props) => {
    const {
        application,
        stepId,
        latestSelected,
        activeCandidateId,
        employeeData,
        openApplicantDetail,
        boardRoam,
        filteredApplicationsList,
        index,
        setSearchParams,
        setAnchorEl,
        setDialogData,
        handleStarClick,
    } = props;

    const taskId = `task-${application?._id}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: taskId,
            data: { type: 'task', sourceStepId: stepId, taskId: application._id },
        });
    const style: React.CSSProperties = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.8 : 1,
    };
   
     
    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            sx={{
                outline: 'none',
                borderRadius: 0.75,
                border: '1px solid #eee',
                borderLeft: `4px solid ${application?.currentRecruitmentStepId?.color}`,
                backgroundColor: application.isAppliedViaWhatsapp
                    ? '#A8EEC7'
                    : latestSelected === application?.candidateId?._id ||
                        activeCandidateId === application?.candidateId?._id
                        ? indigo[50]
                        : application?.viewedBy?.some((v: any) => v.employeeId === employeeData?._id && v.isSeen)
                            ? indigo[100]
                            : 'white',
                marginBottom: '8px',
            }}
        >
            <div
                onClick={() => {
                    openApplicantDetail(application?.candidateId?._id);
                    boardRoam.handleCandidateList(filteredApplicationsList, index);
                }}
                className="py-3 rounded-lg px-3 relative"
            >
                <div className="flex items-start justify-around gap-x-2">
                    <Avatar>
                        {application?.candidateId?.name?.[0]}
                        {application?.candidateId?.surname?.[0]}
                    </Avatar>
                    <div>
                        <Typography variant="subtitle2">
                            {application?.candidateId?.name} {application?.candidateId?.surname}
                        </Typography>
                        <Tooltip
                            title={
                                isValid(new Date(application.createdAt))
                                    ? format(new Date(application.createdAt), 'yyyy.MM.dd kk:mm')
                                    : ''
                            }
                        >
                            <Typography variant="caption" className="capitalize">
                                {isValid(new Date(application.createdAt))
                                    ? intlFormatDistance(new Date(application.createdAt), new Date(), { numeric: 'always' })
                                    : ''}
                            </Typography>
                        </Tooltip>
                        <div className="flex gap-2 justify-center items-center mt-2">
                            {application?.candidateScore && (
                                <ApplicantMatchingRateChip rate={(application?.candidateScore ?? 0) * 10} />
                            )}
                            <Badge
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSearchParams((prev) => {
                                        prev.set('comment', 'true');
                                        prev.set('candidateId', application?.candidateId?._id);
                                        return prev;
                                    });
                                }}
                                color="primary"
                            >
                                <Comment01Icon size={18} />
                            </Badge>
                            <Badge
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStarClick(application);
                                }}
                            >
                                <StarIcon
                                    size={18}
                                    style={{
                                        color: application?.viewedBy?.some(
                                            (v: any) => v.employeeId === employeeData?._id && v.star
                                        )
                                            ? 'gold'
                                            : 'grey',
                                        fill: application?.viewedBy?.some(
                                            (v: any) => v.employeeId === employeeData?._id && v.star
                                        )
                                            ? 'gold'
                                            : 'none',
                                    }}
                                />
                            </Badge>
                        </div>
                    </div>
                    <IconButton
                        color="inherit"
                        sx={{ color: 'text.secondary' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                            setDialogData({
                                candidateId: application?.candidateId?._id,
                                currentEmployeeId: application?.employeeId?._id,
                                selectedEmployeeId: application?.employeeId?._id,
                                application: application,
                            });
                        }}
                        size="small"
                    >
                        <MoreVertOutlined />
                    </IconButton>
                    {application?.viewedBy?.some((v: any) => v.employeeId === employeeData?._id && v.isSeen) && (
                        <div className="absolute bottom-1 left-1">
                            <Tooltip title="Seen">
                                <EyeIcon size={16} />
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </Box>
    );
}

export default SortableTask;
