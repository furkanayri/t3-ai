import { useGetAllCandidateCvFilesQuery } from 'src/hooks/useServices';
import { useCandidateDetail } from '../../CandidateApplicantDetail';
import { array } from 'src/utils';
import { Alert, Chip, CircularProgress, Tooltip, Typography } from '@mui/material';
import { intlFormatDistance, isValid } from 'date-fns';
import { DownloadCVButton } from 'src/components';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function FilesTab() {
  const { t } = useTranslation();
  const { candidateState } = useCandidateDetail();
  const candidateId = candidateState.data?._id ?? ""
  const filesQuery = useGetAllCandidateCvFilesQuery({ candidateId });
  useEffect(() => {
    filesQuery.refetch();
  }, [candidateId])
  const userData = candidateState.data?.userId
  const userInfo = `${userData?.name} ${userData?.surname}`
  const filesData = array<any>(filesQuery.data?.results);
  if (filesQuery.isLoading)
    return (
      <div className="mx-4 my-4">
        <CircularProgress />
      </div>
    );

  if (filesQuery.isError) {
    return (
      <div className="mx-4 my-4">
        <Alert
          severity="info"
          icon={false}
        >
          {(filesQuery?.error as any)?.message}
        </Alert>
      </div>
    );
  }

  if (filesData.length === 0)
    return (
      <div className="mx-4 my-4">
        <Alert
          severity="info"
          icon={false}
        >
          {t('notFoundAnyFile')}
        </Alert>
      </div>
    );

  return (
    <div className="grid grid-cols-3 gap-4 mx-4 my-4">
      {filesData.map((file, ind) => {
        return (
          <div
            className="border rounded-md px-4 py-4 bg-slate-50"
            key={file?._id}
          >
            <div className="flex items-start flex-col gap-2">
              <Tooltip title={file?.title}>
                <Chip
                  label={file?.title}
                  size="small"
                  className="!bg-slate-200 !text-xs"
                />
              </Tooltip>
              <div className="flex items-center justify-between gap-x-2 flex-1 w-full">
                <Tooltip title={new Date(file.createdAt).toLocaleString()}>
                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    {isValid(new Date(file.createdAt))
                      ? intlFormatDistance(new Date(file.createdAt), new Date(), {
                        numeric: 'always',
                      })
                      : null}
                  </Typography>
                </Tooltip>
                <DownloadCVButton
                  id={file?._id}
                  fileName={`${userInfo.split(' ').join('_').toLocaleUpperCase()}_CV.pdf`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
