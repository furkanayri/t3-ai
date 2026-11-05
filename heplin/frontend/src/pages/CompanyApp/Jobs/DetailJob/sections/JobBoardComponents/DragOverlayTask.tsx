import React, { useMemo } from 'react';
import { Box, Avatar, Typography, Tooltip, Badge } from '@mui/material';
import { format, intlFormatDistance, isValid } from 'date-fns';
import { Comment01Icon, EyeIcon, StarIcon } from 'hugeicons-react';
import { ApplicantMatchingRateChip } from '../../components';

export type DragOverlayTaskProps = {
    task: any;
    employeeData?: any;
};

const DragOverlayTask: React.FC<DragOverlayTaskProps> = ({ task, employeeData }) => {
    const formattedDate = useMemo(() => {
        const date = new Date(task.createdAt);
        return isValid(date) ? format(date, 'yyyy.MM.dd kk:mm') : '';
    }, [task.createdAt]);

    const relativeDate = useMemo(() => {
        const date = new Date(task.createdAt);
        return isValid(date) ? intlFormatDistance(date, new Date(), { numeric: 'always' }) : '';
    }, [task.createdAt]);

    const isSeen = useMemo(() =>
        task?.viewedBy?.some((v: any) => v.employeeId === employeeData?._id && v.isSeen),
        [task?.viewedBy, employeeData?._id]
    );

    const isStarred = useMemo(() =>
        task?.viewedBy?.some((v: any) => v.employeeId === employeeData?._id && v.star),
        [task?.viewedBy, employeeData?._id]
    );

    return (
        <Box
            sx={{
                outline: 'none',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                borderLeft: `4px solid ${task?.currentRecruitmentStepId?.color || '#E5E7EB'}`,
                backgroundColor: task.isAppliedViaWhatsapp
                    ? '#D1FAE5'
                    : isSeen
                        ? '#F3F4F6'
                        : '#FFFFFF',
                marginBottom: '8px',
                minWidth: 250,
                opacity: 0.9,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
        >
            <div className="py-3 rounded-lg px-3 relative">
                <div className="flex items-start justify-around gap-x-2">
                    <Avatar>
                        {task?.candidateId?.name?.[0]}
                        {task?.candidateId?.surname?.[0]}
                    </Avatar>
                    <div>
                        <Typography variant="subtitle2">
                            {task?.candidateId?.name} {task?.candidateId?.surname}
                        </Typography>
                        <Tooltip title={formattedDate}>
                            <Typography variant="caption" className="capitalize">
                                {relativeDate}
                            </Typography>
                        </Tooltip>
                        <div className="flex gap-2 justify-center items-center mt-2">
                            {task?.candidateScore && (
                                <ApplicantMatchingRateChip rate={(task?.candidateScore ?? 0) * 10} />
                            )}
                            <Badge color="primary">
                                <Comment01Icon size={18} />
                            </Badge>
                            <Badge>
                                <StarIcon
                                    size={18}
                                    style={{
                                        color: isStarred ? 'gold' : 'grey',
                                        fill: isStarred ? 'gold' : 'none',
                                    }}
                                />
                            </Badge>
                        </div>
                    </div>
                    {isSeen && (
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
};

export default DragOverlayTask;