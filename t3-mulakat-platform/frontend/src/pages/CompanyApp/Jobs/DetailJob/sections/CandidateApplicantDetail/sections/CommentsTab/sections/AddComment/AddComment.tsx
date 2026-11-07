import { LoadingButton } from '@mui/lab';
import { TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useCreateCandidateCommentMutation } from 'src/hooks/useServices/useCommentServices';
import { useCandidateDetail } from '../../../../CandidateApplicantDetail';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default function AddComment({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const addComment = useCreateCandidateCommentMutation();
  const { candidateState } = useCandidateDetail();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content || !candidateState.data?._id) return;

    addComment.mutate(
      { content, candidateId: candidateState.data?._id },
      {
        onSuccess: (res) => {
          setContent('');
          onSuccess();
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        },
      }
    );
  };
  return (
    <form onSubmit={onSubmitHandler}>
      <div className="relative my-4">
        <TextField
          multiline
          minRows={1}
          fullWidth
          value={content ?? ''}
          onChange={(e) => setContent(e.target.value ?? '')}
          size="small"
          className="!bg-slate-50"
          InputProps={{
            sx: { pb: 10 },
          }}
          placeholder={t("addNewComment")}
        />
        <div className="absolute bottom-2 right-4">
          <LoadingButton
            type="submit"
            variant="contained"
            loading={addComment.isLoading}
          >
            {t('comment')}
          </LoadingButton>
        </div>
      </div>
    </form>
  );
}
