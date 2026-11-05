import React, { useMemo } from 'react';
import { Box, Avatar, Typography, Tooltip, IconButton, Badge } from '@mui/material';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { format, intlFormatDistance, isValid } from 'date-fns';
import { MoreVertOutlined } from '@mui/icons-material';
import { Comment01Icon, EyeIcon, StarIcon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';
import { ApplicantMatchingRateChip } from './components';

interface DisqualifiedStepProps {
    disqualified: any[];
    employeeData: any;
    latestSelected: string;
    activeCandidateId: any;
    stepColorHexMap: any;
    openApplicantDetail: (id: string) => void;
    boardRoam: any;
    setSearchParams: (callback: (prev: any) => any) => void;
    setAnchorEl: (element: HTMLElement | null) => void;
    setDialogData: (data: any) => void;
    handleStarClick: (application: any) => void;
    sortOption: string;
}

export const DisqualifiedStep: React.FC<DisqualifiedStepProps> = ({
    disqualified,
    employeeData,
    latestSelected,
    activeCandidateId,
    stepColorHexMap,
    openApplicantDetail,
    boardRoam,
    setSearchParams,
    setAnchorEl,
    setDialogData,
    sortOption,
}) => {
    const { t } = useTranslation();

    const sortedDisqualified = useMemo(() => {
        if (sortOption === 'candidateScore') {
            const applicationsWithScore = disqualified.filter((app) => app.hasOwnProperty('candidateScore'));
            const applicationsWithoutScore = disqualified.filter((app) => !app.hasOwnProperty('candidateScore'));

            applicationsWithScore.sort((a, b) => b.candidateScore - a.candidateScore);

            return [...applicationsWithScore, ...applicationsWithoutScore];
        }

        return disqualified;
    }, [disqualified, sortOption]);

    const disqualifiedIds = sortedDisqualified?.map((app) => app._id) || [];

    return (
        <Box
            key="disqualified-step"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                overflowX: 'hidden',
                overflowY: 'hidden',
                width: {
                    xs: 200,
                    sm: 300,
                },
                height: '100%',
            }}
        >
            <Box
                sx={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: '12px',
                    height: '100%',
                    border: '2px solid #FEE2E2',
                    minHeight: '400px',
                }}
            >
                <Box sx={{ flexGrow: 1, height: '100%', p: 2 }}>
                    <SortableContext items={disqualifiedIds} strategy={verticalListSortingStrategy}>
                        <div
                            style={{
                                minHeight: 300,
                                height: '100%',
                            }}
                        >
                            <div className="grid gap-y-2">
                                {sortedDisqualified?.map((application: any, index: number) => (
                                    <SortableItem
                                        key={application._id}
                                        id={application._id}
                                        application={application}
                                        employeeData={employeeData}
                                        latestSelected={latestSelected}
                                        activeCandidateId={activeCandidateId}
                                        stepColorHexMap={stepColorHexMap}
                                        openApplicantDetail={openApplicantDetail}
                                        boardRoam={boardRoam}
                                        setSearchParams={setSearchParams}
                                        setAnchorEl={setAnchorEl}
                                        setDialogData={setDialogData}
                                        index={index}
                                        sortedDisqualified={sortedDisqualified}
                                    />
                                ))}
                            </div>
                        </div>
                    </SortableContext>
                </Box>
            </Box>
        </Box>
    );
};

// SortableItem Bileşeni
function SortableItem({
    id,
    application,
    employeeData,
    latestSelected,
    activeCandidateId,
    stepColorHexMap,
    openApplicantDetail,
    boardRoam,
    setSearchParams,
    setAnchorEl,
    setDialogData,
    index,
    sortedDisqualified,
}: {
    id: string;
    application: any;
    employeeData: any;
    latestSelected: string;
    activeCandidateId: any;
    stepColorHexMap: any;
    openApplicantDetail: (id: string) => void;
    boardRoam: any;
    setSearchParams: (callback: (prev: any) => any) => void;
    setAnchorEl: (element: HTMLElement | null) => void;
    setDialogData: (data: any) => void;
    index: number;
    sortedDisqualified: any[];
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    const { t } = useTranslation();

    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            sx={{
                outline: 'none',
                backgroundColor: application.isAppliedViaWhatsapp
                    ? '#E6FFFA'
                    : latestSelected === application?.candidateId?._id || activeCandidateId === application?.candidateId?._id
                        ? '#FEF2F2'
                        : '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                borderLeft: `3px solid #EF4444`,
                marginBottom: '8px',
                cursor: 'grab',
                '&:active': {
                    cursor: 'grabbing',
                },
            }}
        >
            <div
                onClick={() => {
                    openApplicantDetail(application?.candidateId?._id);
                    boardRoam.handleCandidateList(sortedDisqualified, index);
                }}
                className="py-5 pt-3 rounded-lg px-4 relative"
            >
                <div className="flex items-start justify-between gap-x-2">
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
                                    : null
                            }
                        >
                            <Typography variant="caption" className="capitalize">
                                {isValid(new Date(application.createdAt))
                                    ? intlFormatDistance(new Date(application.createdAt), new Date(), {
                                        numeric: 'always',
                                    })
                                    : null}
                            </Typography>
                        </Tooltip>
                        <div className="flex gap-3 items-end">
                            {application?.candidateScore ? (
                                <ApplicantMatchingRateChip rate={(application?.candidateScore ?? 0) * 10} />
                            ) : null}
                            <Badge
                                className="cursor-pointer p-1 mt-2"
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
                            {/* Star Badge Aktif Edildiğinde Kullanılabilir */}
                            {/* <Badge
                className="cursor-pointer p-1 mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarClick(application);
                }}
              >
                <StarIcon
                  size={18}
                  style={{
                    color: application?.viewedBy?.some((v: any) => v.employeeId === employeeData?._id && v.star)
                      ? 'gold'
                      : 'grey',
                    fill: application?.viewedBy?.some((v: any) => v.employeeId === employeeData?._id && v.star)
                      ? 'gold'
                      : 'none',
                  }}
                />
              </Badge> */}
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
                            <Tooltip title={t('seen')}>
                                <EyeIcon size={16} />
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </Box>
    );
};