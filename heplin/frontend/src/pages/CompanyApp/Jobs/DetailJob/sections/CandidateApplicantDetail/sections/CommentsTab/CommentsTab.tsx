import {
  useDeleteCandidateCommentMutation,
  useGetAllCandidateCommentsQuery,
} from 'src/hooks/useServices/useCommentServices';
import { AddComment, Comment, DeleteConfirm } from './sections';
import { useCandidateDetail } from '../../CandidateApplicantDetail';
import { Alert, CircularProgress, Divider } from '@mui/material';
import { Fragment, useState } from 'react';
import { array } from 'src/utils';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

type ActionState = {
  mode: 'initial' | 'delete';
  id: null | string;
};

const initialActionState: ActionState = {
  mode: 'initial',
  id: null,
};
export default function CommentsTab() {
  const { t } = useTranslation();
  const [commentActionState, setCommentActionState] = useState<ActionState>(initialActionState);
  const { candidateState } = useCandidateDetail();
  const { enqueueSnackbar } = useSnackbar();


  const candidateId = candidateState?.data?._id ?? ''
  const deleteCommentMutation = useDeleteCandidateCommentMutation();
  const commentsQuery = useGetAllCandidateCommentsQuery({ candidateId, });
  const commentsData = array<any>(commentsQuery.data?.results);

  const clearActionState = () => {
    setCommentActionState(initialActionState);
  };

  const openDeleteActionDialog = (commentId: string) => {
    setCommentActionState({ id: commentId, mode: 'delete' });
  };

  const onDeleteSubmit = () => {
    if (!commentActionState.id) return;
    deleteCommentMutation.mutate(
      { id: commentActionState.id, candidateId },
      {
        onSuccess: (res) => {
          clearActionState();
          commentsQuery.refetch();
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        },
      }
    );
  };

  return (
    <div className="mt-4 space-y-2 mx-4">
      <DeleteConfirm
        open={commentActionState.mode === 'delete'}
        onClose={() => {
          clearActionState();
        }}
        onConfirm={() => {
          onDeleteSubmit();
        }}
        isDeleting={deleteCommentMutation.isLoading}
      />
      <AddComment
        onSuccess={() => {
          commentsQuery.refetch();
        }}
      />
      <div className="space-y-2 relative min-h-[275px]">
        {commentsQuery.isFetching ? (
          <div className="absolute left-0 right-0 bottom-0 top-0 flex items-start justify-center bg-slate-50 bg-opacity-25">
            <CircularProgress />
          </div>
        ) : commentsQuery.isError ? (
          <Alert severity="error">{(commentsQuery.error as any)?.message}</Alert>
        ) : commentsData.length === 0 ? (
          <Alert
            severity="info"
            icon={false}
          >
            {t('notFoundAnyComments')}
          </Alert>
        ) : null}

        {commentsData?.map((comment: any) => {
          return (
            <Fragment key={comment?._id}>
              <Comment
                onDelete={() => {
                  openDeleteActionDialog(comment._id);
                }}
                users={comment?.user}
                createdBy={comment?.createdBy}
                content={comment?.content}
                createdAt={comment?.createdAt}
              />
              <Divider />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
