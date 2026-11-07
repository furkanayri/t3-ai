import { LoadingButton } from '@mui/lab';
import { TextField } from '@mui/material';
import { useMemo, useState, type FormEvent } from 'react';
import { useCreateCandidateCommentMutation } from 'src/hooks/useServices/useCommentServices';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

export default function AddComment({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const addComment = useCreateCandidateCommentMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams()
  const candidateId = useMemo(() => searchParams.get('candidateId'), [searchParams]) ?? ''

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content || !candidateId) return;

    addComment.mutate(
      { content, candidateId: candidateId },
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
      <div className="relative my-4 ">
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
