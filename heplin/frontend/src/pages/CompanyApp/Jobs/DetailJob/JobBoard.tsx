import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
} from '@mui/material';
import {
  MoreVertOutlined,
  BadgeOutlined,
  Grading,
  ExpandMore,
  Handshake,
  EmailOutlined,
  Work,
  DisabledByDefaultOutlined,
  NoteAlt as NoteAltIcon
} from '@mui/icons-material';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  DragOverEvent,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ApplicantStatusChip } from './components';
import { useSearchParams } from 'react-router-dom';
import {
  useBulkDisqualifyJobApplicationsMutation,
  useDisqualifyJobApplicationMutation,
  useGetMyEmployeeDataQuery,
  useGetRecruitmentStageDetailQuery,
  useUpdateApplicantReview
} from 'src/hooks/useServices';
import { useDetailJob } from './DetailJobProvider';
import { stepColorHexMap } from 'src/utils';
import {
  DisqualifyApplicationDialog,
  EvaluateCandidateDialog,
  ManageHiringPersonelDialog,
  StartOnboardingDialog,
  BulkDisqualifyApplicationsDialog
} from './sections';
import { RecruitmentStageStep } from 'src/types';
import { useNewMail } from 'src/providers';
import { DisqualifiedStep } from './DisqualifiedComponent';
import HireCandidate from './sections/HireCandidate';
import SendInterviewInvitationDialog from './sections/InterviewInvitation';
import SortableColumn from './sections/JobBoardComponents/SortableColumn';
import SortableTask from './sections/JobBoardComponents/SortableTask';
import DragOverlayTask from './sections/JobBoardComponents/DragOverlayTask';

export function Component() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [activeId, setActiveId] = useState<null | string>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogData, setDialogData] = useState<any | undefined>(undefined);
  const [latestSelected, setLatestSelected] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const { jobState, onCandidateMove, hiringTeamsState, boardRoam } = useDetailJob();
  const hiringTeams = hiringTeamsState?.data?.results;
  const disqualified = hiringTeamsState?.data?.disqualified;
  const [disqualifyData, setDisqualifyData] = useState({ applicationId: '', candidateId: '' });
  const recruitmentStageQuery = useGetRecruitmentStageDetailQuery(jobState.data?.recruitmentStageId);
  const recruitmentStageData = recruitmentStageQuery?.data?.recruitmentStage;
  const disqualifyMutation = useDisqualifyJobApplicationMutation();
  const updateApplicantMutation = useUpdateApplicantReview();
  const activeCandidateId = searchParams.get('candidateId');
  const employeeDataQuery = useGetMyEmployeeDataQuery();
  const employeeData = employeeDataQuery?.data?.employee;
  const { openNewMail } = useNewMail();
  const [bulkDisqualifyOpen, setBulkDisqualifyOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  const bulkDisqualifyMutation = useBulkDisqualifyJobApplicationsMutation();
  const jobId = jobState?.data?._id;
  const [sortOption, setSortOption] = useState('candidateScore');

  const [isDragging, setIsDragging] = useState(false);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const [localApplications, setLocalApplications] = useState<any[]>(hiringTeams || []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      if (isDragging) return;
      isDown = true;
      container.classList.add('active');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const onMouseLeave = () => {
      if (isDragging) return;
      isDown = false;
      container.classList.remove('active');
    };

    const onMouseUp = () => {
      if (isDragging) return;
      isDown = false;
      container.classList.remove('active');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging || !isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = x - startX;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [isDragging]);


  useEffect(() => {
    setLocalApplications(hiringTeams || []);
  }, [hiringTeams]);
  const onDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    
    // Eğer over varsa ve id string ise
    if (over?.id && typeof over.id === 'string') {
      // Doğrudan column- ile başlayan id'leri kontrol et
      if (over.id.startsWith('column-')) {
        setOverColumnId(over.id);
      } 
      // Task üzerindeyse, onun bulunduğu sütunu bul
      else if (over.id.startsWith('task-') && over.data.current) {
        const overData = over.data.current as any;
        if (overData?.sourceStepId) {
          setOverColumnId(`column-${overData.sourceStepId}`);
        }
      }
    } else {
      setOverColumnId(null);
    }
  };
  const onDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const id = event.active.id as string;
    setActiveId(id);
    const allTasks = sortedApplications.flatMap((team: any) => team.applications);
    const task = allTasks.find((app: any) => `task-${app._id}` === id);
    setActiveTask(task || null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    setOverColumnId(null);
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeData = active.data.current as any;
    if (activeData?.type !== 'task') {
      setActiveId(null);
      return;
    }

    const { sourceStepId, taskId } = activeData;
    let targetStepId: string | null = null;
    const overData = over.data.current as any;

    if (overData?.type === 'task') {
      targetStepId = overData?.sourceStepId;
    } else if (overData?.type === 'column') {
      targetStepId = overData?.stepId;
    }

    if (!targetStepId || sourceStepId === targetStepId) {
      setActiveId(null);
      return;
    }

    const allTasks = localApplications.flatMap((team: any) => team.applications);
    const foundApplication = allTasks.find((app: any) => app._id === taskId);
    if (!foundApplication) {
      setActiveId(null);
      return;
    }

    const stepDetail = recruitmentStageData?.stepsSort?.find((st: any) => st._id === targetStepId);
    if (!stepDetail) {
      setActiveId(null);
      return;
    }

    // Optimistic update: Move the application locally first
    const updatedApplications = localApplications.map((team: any) => {
      const updatedApps = team.applications.map((app: any) => {
        if (app._id === taskId) {
          return { ...app, currentRecruitmentStepId: stepDetail };
        }
        return app;
      });
      return { ...team, applications: updatedApps };
    });

    setLocalApplications(updatedApplications);


    try {
      await onCandidateMove(stepDetail, taskId, sourceStepId, foundApplication);
      hiringTeamsState.refetch(); // Sync with backend after success
      enqueueSnackbar(t('CandidateMovedSuccessfully'), { variant: 'success' });
    } catch (error) {

      setLocalApplications(hiringTeams || []);
      enqueueSnackbar(t('FailedMoveCandidate'), { variant: 'error' });
    }

    setActiveId(null);
  };

  const openApplicantDetail = (candidateId: string) => {
    setLatestSelected(candidateId);
    setSearchParams((prev) => {
      prev.set('candidateId', candidateId);
      return prev;
    });
  };

  const handleClickDisqualify = (data: { applicationId: string; candidateId: string }) => {
    setDialogOpen(true);
    setDisqualifyData(data);
  };

  const handleBulkDisqualifyClick = (step: any) => {
    setSelectedStep(step);
    setBulkDisqualifyOpen(true);
  };

  const handleBulkDisqualifyConfirm = async (disqualifyReason: string) => {
    if (!jobId || !selectedStep) return;

    const stepId = selectedStep._id;
    const payload = { stepId, disqualifyReason };

    bulkDisqualifyMutation.mutateAsync(
      { jobId, payload },
      {
        onSuccess: () => {
          enqueueSnackbar('All candidates have been disqualified', { variant: 'success' });
          hiringTeamsState.refetch();
          setBulkDisqualifyOpen(false);
          setSelectedStep(null);
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        },
      }
    );
  };

  const handleSubmitDisqualify = async (disqualifyReason: string, customMailContent?: string) => {
    if (!jobId) return;
    const { applicationId, candidateId } = disqualifyData;
    const payload = {
      applicationId,
      candidateId,
      disqualifyReason,
      customMailContent
    };
    console.log(payload);

    return disqualifyMutation.mutateAsync(
      { jobId, payload },
      {
        onSuccess: () => {
          enqueueSnackbar('Application disqualified', { variant: 'success' });
          hiringTeamsState.refetch();
          setDialogOpen(false);
          handleClose();
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        }
      }
    );
  };

  const handleClose = () => {
    setSearchParams((prev) => {
      prev.delete('dialog');
      return prev;
    });
    setAnchorEl(null);
    setDialogData(undefined);
  };

  const menuItems = [
    {
      label: t('sendEmail'),
      icon: EmailOutlined,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'email-candidate'
    },
    {
      label: t('manageHiringPersonel'),
      icon: BadgeOutlined,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'manage-hiring-personel'
    },
    {
      label: t('evaluateCandidate'),
      icon: Grading,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'evaluate-candidate'
    },
    {
      label: t('startOnboarding'),
      icon: Handshake,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'start-onboarding'
    },
    {
      label: t('hire'),
      icon: Work,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'hire-candidate'
    },
    {
      label: t('disqualify'),
      icon: DisabledByDefaultOutlined,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'disqualify-candidate'
    },
    {
      label: t('interview'),
      icon: NoteAltIcon,
      value: 'closed',
      color: 'blue',
      isVisible: jobState.data?.status === 'active',
      key: 'send-interview-invitation'
    }
  ];

  const handleStarClick = (application: any) => {
    const employeeId = employeeData?._id;
    const currentViewedBy = application.viewedBy?.find((v: any) => v.employeeId === employeeId);
    const currentStarValue = currentViewedBy?.star ?? false;
    const payload = {
      viewedBy: {
        employeeId: employeeId,
        star: !currentStarValue
      },
      operation: currentViewedBy ? 'update' : 'add'
    };

    updateApplicantMutation.mutateAsync(
      {
        jobId: jobId ?? '',
        id: application._id,
        payload
      },
      {
        onSuccess: () => {
          hiringTeamsState.refetch();
        }
      }
    );
  };

  const sortApplications = (applications: any[]) => {
    let applicationsWithScore = applications.filter((app) =>
      app.hasOwnProperty('candidateScore')
    );
    let applicationsWithoutScore = applications.filter(
      (app) => !app.hasOwnProperty('candidateScore')
    );

    if (sortOption === 'candidateScore') {
      applicationsWithScore.sort((a, b) => b.candidateScore - a.candidateScore);
    }

    return [...applicationsWithScore, ...applicationsWithoutScore];
  };

  const sortedApplications = useMemo(() => {
    return localApplications?.map((item: any) => {
      const sortedApps = sortApplications(item.applications);
      return { ...item, applications: sortedApps };
    });
  }, [localApplications, sortOption]);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        flexShrink: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        cursor: isDragging ? 'default' : 'grab',
        '&.active': {
          cursor: 'grabbing'
        },
        '&::-webkit-scrollbar': {
          height: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => theme.palette.primary.main,
          borderRadius: '8px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: (theme) => theme.palette.background.paper
        }
      }}
    >
      <JobBoardHeader steps={recruitmentStageData?.stepsSort} handleBulkDisqualifyClick={handleBulkDisqualifyClick} />

      <Box sx={{ background: '#f3f4f6', width: 'max-content' }}>
        {sortedApplications
          ?.filter((item: any) => item.employee)
          .map((item: any, index: number) => {
            const { employee, applications } = item;
            return (
              <Accordion
                key={(employee?._id ?? 'un-assigned') + '-' + index}
                defaultExpanded={true}
                style={{ marginBottom: '20px' }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  style={{ margin: '0px 20px', display: 'inline-flex', gap: '20px' }}
                >
                  <Typography>
                    {`${employee?.name} ${employee?.surname} - ${applications?.length ?? ''}`}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails style={{ padding: '0px' }}>
                  <Box sx={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
                    <Box
                      component="main"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                      }}
                    >                      <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                      >
                        <SortableContext
                          items={(recruitmentStageData?.stepsSort || []).map((st: any) => `column-${st._id}`).concat(['column-disqualified'])}
                        // strategy={horizontalListSortingStrategy}
                        >
                          <Stack alignItems="stretch" direction="row" spacing={1}>
                            {recruitmentStageData?.stepsSort?.map((step: any) => {
                              const filteredApplications = applications?.filter(
                                (a: any) => a.currentRecruitmentStepId?._id === step?._id
                              );
                              
                              const filteredApplicationsList = useMemo(() => filteredApplications, [filteredApplications]);
                              
                              return (
                                <SortableColumn
                                  key={step?._id}
                                  step={step}
                                  isOver={overColumnId === `column-${step._id}`}
                                >
                                  <Box
                                    sx={{

                                      borderRadius: 1,
                                      height: '100%'
                                    }}
                                  >
                                    <Box sx={{ flexGrow: 1, height: '100%', px: 0.75, pt: 0.75 }}>
                                      <SortableContext
                                        items={filteredApplicationsList?.map((app: any) => `task-${app._id}`)}
                                        strategy={verticalListSortingStrategy}
                                      >
                                        <div style={{ minHeight: 300, height: '100%' }}>
                                          {filteredApplicationsList?.map((application: any, idx: number) => (
                                            <SortableTask
                                              key={application._id}
                                              application={application}
                                              stepId={step._id}
                                              latestSelected={latestSelected}
                                              activeCandidateId={activeCandidateId}
                                              employeeData={employeeData}
                                              openApplicantDetail={openApplicantDetail}
                                              boardRoam={boardRoam}
                                              filteredApplicationsList={filteredApplicationsList}
                                              index={idx}
                                              setSearchParams={setSearchParams}
                                              setAnchorEl={setAnchorEl}
                                              setDialogData={setDialogData}
                                              handleStarClick={handleStarClick}
                                            />
                                          ))}
                                        </div>
                                      </SortableContext>
                                    </Box>
                                  </Box>
                                </SortableColumn>
                              );
                            })}
                            <SortableColumn step={{ _id: 'disqualified', title: 'Disqualified' }}>
                              <DisqualifiedStep
                                disqualified={disqualified}
                                sortOption={sortOption}
                                employeeData={employeeData}
                                latestSelected={latestSelected}
                                activeCandidateId={activeCandidateId}
                                stepColorHexMap={stepColorHexMap}
                                openApplicantDetail={openApplicantDetail}
                                boardRoam={boardRoam}
                                setSearchParams={setSearchParams}
                                setAnchorEl={setAnchorEl}
                                setDialogData={setDialogData}
                                handleStarClick={handleStarClick}
                              />
                            </SortableColumn>
                          </Stack>
                        </SortableContext>
                        <DragOverlay>
                          {activeTask ? <DragOverlayTask task={activeTask} employeeData={employeeData} /> : null}
                        </DragOverlay>
                      </DndContext>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {menuItems.map((menu) => {
          const Icon = menu.icon;
          if (!menu.isVisible) return null;
          return (
            <MenuItem
              key={menu.key}
              onClick={() => {
                if (menu.key === 'email-candidate') {
                  const candidateEmail = dialogData?.application?.candidateId?.email;
                  openNewMail({
                    initialTo: candidateEmail,
                    lockToField: true
                  });
                  return;
                }
                if (menu.key === 'disqualify-candidate') {
                  handleClickDisqualify({
                    applicationId: dialogData?.application?._id,
                    candidateId: dialogData?.application?.candidateId?._id
                  });
                  return;
                }
                setSearchParams((prev) => {
                  prev.set('dialog', menu.key);
                  return prev;
                });
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText> {menu.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>

      <ManageHiringPersonelDialog
        open={searchParams.get('dialog') === 'manage-hiring-personel'}
        onClose={handleClose}
        dialogData={dialogData}
        setDialogData={setDialogData}
      />
      <EvaluateCandidateDialog
        open={searchParams.get('dialog') === 'evaluate-candidate'}
        onClose={handleClose}
        dialogData={dialogData}
        setDialogData={setDialogData}
      />
      <StartOnboardingDialog
        open={searchParams.get('dialog') === 'start-onboarding'}
        onClose={handleClose}
        dialogData={dialogData}
        setDialogData={setDialogData}
      />
      <HireCandidate
        open={searchParams.get('dialog') === 'hire-candidate'}
        onClose={handleClose}
        dialogData={dialogData}
      />
      <DisqualifyApplicationDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (reason) => {
          handleSubmitDisqualify(reason);
        }}
      />
      <BulkDisqualifyApplicationsDialog
        isOpen={bulkDisqualifyOpen}
        onClose={() => setBulkDisqualifyOpen(false)}
        onSubmit={handleBulkDisqualifyConfirm}
      />
      <SendInterviewInvitationDialog
        open={searchParams.get('dialog') === 'send-interview-invitation'}
        onClose={handleClose}
        dialogData={dialogData}
        interviewId={jobState.data?.aiInterviewConfig}
        videoInterviewId={jobState.data?.videoInterviewId}
      />
    </Box>
  );
}

Component.displayName = 'JobBoard';


function JobBoardHeader({ steps, handleBulkDisqualifyClick }: { steps: RecruitmentStageStep[], handleBulkDisqualifyClick: any }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            flexShrink: 1,
            height: '40px'
          }}
        >
          <Stack alignItems="stretch" direction="row" spacing={1}>
            {steps?.map((step: any) => (
              <Box
                key={step?._id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                  overflowX: 'hidden',
                  overflowY: 'hidden',
                  width: { xs: 200, sm: 300 },
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'neutral.900' : 'neutral.100',
                    borderRadius: 1,
                    height: '100%'
                  }}
                >
                  <Box sx={{ flexGrow: 1, height: '100%', px: 0.75, pt: 0.75 }}>
                    <div className="mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                      <ApplicantStatusChip
                        status={step?._id}
                        label={<>{step.title}</>}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleBulkDisqualifyClick(step)}
                        style={{ marginLeft: 'auto' }}
                      >
                        <DisabledByDefaultOutlined />
                      </IconButton>
                    </div>
                  </Box>
                </Box>
              </Box>
            ))}
            <Box
              key="disqualified-step"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                overflowX: 'hidden',
                overflowY: 'hidden',
                width: { xs: 200, sm: 300 },
                height: '100%'
              }}
            >
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'neutral.900' : 'neutral.100',
                  borderRadius: 1,
                  height: '100%'
                }}
              >
                <Box sx={{ flexGrow: 1, height: '100%', px: 0.75, pt: 0.75 }}>
                  <div className="mb-2">
                    <ApplicantStatusChip
                      status="disqualified"
                      label={<span style={{ color: 'red' }}>{t('disqualified')}</span>}
                    />
                  </div>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
