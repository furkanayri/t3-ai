import { Alert, Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import {
  useCandidateStepUpdateMutation,
  useDeleteJobMutation,
  useGetJobDetailQuery,
  useUpdateJobStatusMutation,
  useGetHiringTeamsQuery,
  useGetPostingChannelsOfUser,
  useTogglePublishMutation
} from 'src/hooks/useServices';
import { useAuth, useNewMail } from 'src/providers';
import { getRecruitmentEmailConfigDetailService, postSendTemplatedEmailService } from 'src/services';
import { RecruitmentEmailConfig } from 'src/types';
import { JobTogglePublish, JobStatusAction } from 'src/types/jobPost';
import { array } from 'src/utils';

type UpdateState = {
  isLoading: boolean;
  isError: boolean;
  error: null | string;
};

type JobContext = {
  jobState: State;
  hiringTeamsState: State;
  onCandidateMove: (stepId: string, jobApplicationId: string, sourceStepId: string, application: any) => void;
  deleteJob: () => void;
  updateJobStatus: (status: JobStatusAction, options: any) => void;
  deleteJobState: UpdateState;
  updateJobStatusState: UpdateState;
  togglePublish: (payload: JobTogglePublish, options: any) => void,
  togglePublishState: {
    isLoading: boolean,
    isError: boolean,
    error: null | string,
  },
  postingChannels: any[],

  boardRoam: {
    currentIndex: number,
    drawercandidateList: []
    handleCandidateList: (filteredIndex: any, index: any) => void,
    handlePrevious: () => void,
    handleNext: () => void
  },
};

type State = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: any; //FIXME: change any state job;
  refetch?: any //add type and add refetch functions for all states
};

const DetailJobContext = createContext<JobContext>({
  jobState: {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
  },
  hiringTeamsState: {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
    refetch: () => { },
  },
  onCandidateMove: (stepId: string, jobApplicationId: string, sourceStepId: string, application: any) => { },
  deleteJob: () => { },
  deleteJobState: {
    isLoading: false,
    isError: false,
    error: null,
  },
  updateJobStatus: (status: JobStatusAction, options: any) => { },
  updateJobStatusState: {
    isLoading: false,
    isError: false,
    error: null,
  },
  togglePublish: (payload: JobTogglePublish, options: any) => { },
  togglePublishState: {
    isLoading: false,
    isError: false,
    error: null,
  },
  postingChannels: [],
  boardRoam: {
    currentIndex: 0,
    drawercandidateList: [],
    handleCandidateList: (filteredIndex: any, index: any) => { },
    handlePrevious: () => { },
    handleNext: () => { }
  },

});

export const useDetailJob = () => {

  const context = useContext(DetailJobContext);

  if (!context)
    throw new Error('useDetailJob hook must be used within <DetailJobProvider> component');

  return context;
};

export default function DetailJobProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { id, companySlug } = useParams();
  const { activeTenantId } = useAuth()
  const { isLoading, isFetching, isError, error, data, refetch } = useGetJobDetailQuery({ id: id! });
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const postingChannelsQuery = useGetPostingChannelsOfUser({ tenantId: activeTenantId?.toString() || "" });
  const postingChannels = array(postingChannelsQuery.data?.results)

  const candidateMoveMutation = useCandidateStepUpdateMutation();
  const togglePublishMutation = useTogglePublishMutation();
  const updateJobStatusMutation = useUpdateJobStatusMutation();
  const deleteJobMutation = useDeleteJobMutation();
  const hiringTeamsQuery = useGetHiringTeamsQuery({ id: id! });
  const queryClient = useQueryClient();

  const [drawercandidateList, setDrawerCandidateList] = useState<any>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams();

  const { openNewMail } = useNewMail()


  const sendEmailIfConfigured = async (_stepId: string, _jobApplicationId: string, _application: any) => {
    if (!_stepId) return
    const emailConfig: RecruitmentEmailConfig = (await getRecruitmentEmailConfigDetailService(_stepId))?.config
    if (!emailConfig) return
    if (!!emailConfig && emailConfig.isEmailsActive) {

      emailConfig.emailFlow === "auto" &&
        enqueueSnackbar(t("sendEmailToCandidateQuestion"), {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center'
          },
          variant: 'info',
          persist: true,
          preventDuplicate: true,
          action: (key) => (
            <>
              <Button
                sx={{ color: "white" }}
                onClick={async () => {
                  const res = await postSendTemplatedEmailService({
                    recruitmentStageStepId: _stepId,
                    jobApplicationId: _jobApplicationId
                  })
                  closeSnackbar();
                  if (res.isSuccess)
                    enqueueSnackbar(t("templateEmailWasSent"), { variant: "success" })
                  else
                    enqueueSnackbar(t("unableToSendTemplateEmail"), { variant: "error" })
                }}
              >
                {t('Yes')}
              </Button>
              <Button sx={{ color: "white" }} onClick={() => closeSnackbar()}>
                {t('No')}
              </Button>
            </>
          ),
        });
      emailConfig.emailFlow === "manual" &&
        enqueueSnackbar(t("sendEmailToCandidateQuestion"), {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center'
          },
          variant: 'info',
          persist: true,
          preventDuplicate: true,
          action: (key) => (
            <>
              <Button
                sx={{ color: "white" }}
                onClick={async () => {
                  const email = _application?.candidateId?.email
                  if (!email)
                    closeSnackbar()

                  openNewMail({
                    initialTo: email,
                    lockToField: true,
                  })
                  closeSnackbar()
                }}
              >
                {t('Yes')}
              </Button>
              <Button sx={{ color: "white" }} onClick={() => closeSnackbar()}>
                {t('No')}
              </Button>
            </>
          ),
        });
    }
  }

  const onCandidateMove = (step: any, jobApplicationId: string, sourceStepId: string, application: any) => {

    candidateMoveMutation.mutate(
      { currentRecruitmentStepId: step?._id, applicantId: jobApplicationId, jobId: id! },
      {
        onSuccess: async (data) => {
          await sendEmailIfConfigured(sourceStepId, jobApplicationId, application)
          await hiringTeamsQuery.refetch();
          queryClient.refetchQueries(['candidates'])
        },
        onError: (err) => {
          enqueueSnackbar((err as any).message, { variant: 'error' });
        },
      }
    );
    queryClient.setQueryData(['jobs', 'hiringTeam', id], (old: any) => {
      const copyData = JSON.parse(JSON.stringify(old));
      copyData?.results?.forEach((resultItem: any) => {
        resultItem?.applications?.forEach((applicationItem: any) => {
          if (applicationItem?._id === jobApplicationId) {
            applicationItem.currentRecruitmentStepId = step;
          }
        });
      });


      return copyData;
    });
  };

  const updateJobStatus = (status: JobStatusAction, options: any) => {
    if (!id) return;
    updateJobStatusMutation.mutate(
      { id, payload: { status } },
      {
        onSuccess: () => {
          refetch();
          options?.onSuccess?.();
        },
        onError: (err: any) => {
          enqueueSnackbar({
            message: err?.message,
            variant: 'error',
          });
        },
      }
    );
  };

  const togglePublish = (payload: JobTogglePublish, options: any) => {
    if (!id) return;
    togglePublishMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          refetch();
          options?.onSuccess?.();
        },
        onError: (err: any) => {

          enqueueSnackbar((err.response.data as any).message, { variant: 'error' })
        },
      }
    );
  };

  const deleteJob = (options?: { onSuccess?: (data: any) => void }) => {
    if (!id) return;

    deleteJobMutation.mutate(
      { id },
      {
        onSuccess: (res) => {
          enqueueSnackbar({
            message: t('jobDeletedsuccessfully'),
          });
          navigate(`/${companySlug}/jobs`);
        },
        onError: (err: any) => {
          enqueueSnackbar({
            message: err?.message,
            variant: 'error',
          });
        },
      }
    );
  };




  const handleCandidateList = (filteredIndex: any[] = [], index: number) => {
    if (filteredIndex.length > 0) {
      setDrawerCandidateList(filteredIndex)
      setCurrentIndex(index)
    }
  };

  const handleNext = () => {
    if (currentIndex < drawercandidateList.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const selectedCandidateNext = drawercandidateList[newIndex];


      if (selectedCandidateNext) {
        setSearchParams((prev: any) => {
          prev.set('candidateId', selectedCandidateNext.candidateId._id);
          return prev;
        });
      }
    }
  };
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const selectedCandidatePrevious = drawercandidateList[newIndex];
      if (selectedCandidatePrevious) {
        setSearchParams((prev: any) => {
          prev.set('candidateId', selectedCandidatePrevious.candidateId._id);
          return prev;
        });
      }
    }
  };
  return (
    <DetailJobContext.Provider
      value={{
        jobState: {
          isLoading,
          isError,
          error,
          data: data?.job
        },
        hiringTeamsState: {
          isLoading: hiringTeamsQuery.isLoading,
          error: hiringTeamsQuery.error,
          data: hiringTeamsQuery.data,
          isError: hiringTeamsQuery.isError,
          refetch: hiringTeamsQuery.refetch
        },
        onCandidateMove,
        deleteJob,
        updateJobStatus,
        togglePublish,
        togglePublishState: {
          isLoading: togglePublishMutation.isLoading || isFetching,
          error: (togglePublishMutation.error as any)?.message ?? null,
          isError: togglePublishMutation.isError,
        },
        deleteJobState: {
          isLoading: deleteJobMutation.isLoading,
          error: (deleteJobMutation.error as any)?.message ?? null,
          isError: deleteJobMutation.isError,
        },
        updateJobStatusState: {
          isLoading: updateJobStatusMutation.isLoading || isFetching,
          error: (updateJobStatusMutation.error as any)?.message ?? null,
          isError: updateJobStatusMutation.isError,
        },
        boardRoam: {
          handleCandidateList,
          handlePrevious,
          handleNext,
          currentIndex,
          drawercandidateList

        },
        postingChannels
      }}
    >
      {isError ? (
        <Alert severity="error">{(error as any)?.message}</Alert>
      ) : !isLoading && !data ? (
        <Alert severity="warning">{t('jobNotFound')}</Alert>
      ) : (
        children
      )}
    </DetailJobContext.Provider>
  );
}
