import { MoreVertOutlined } from '@mui/icons-material';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { intlFormatDistance, isValid } from 'date-fns';
import { DownloadCVButton } from 'src/components';
import { ConfirmDialog, CVUpload } from 'src/components/shared';
import { useDeleteCVFileService, useGetMyCVsQuery } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { array } from 'src/utils';
import EditFilenameDialog from './EditFilenameDialog';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks/use-dialog';
import { CvAutoFillDialog } from '../Components';

type FileActionState = {
  isOpen: boolean;
  mode: 'edit' | 'delete' | 'initial';
  payload: {
    id: null | string;
    title: null | string;
  };
};
interface FileData {
  fileKey: string;
  fileName: string;
  userId: string;
  _id: string;
}
const initialFileActionState: FileActionState = {
  isOpen: false,
  mode: 'edit',
  payload: {
    id: null,
    title: '',
  },
};


export default function CVFiles() {
  const { t } = useTranslation();
  const [fileActionState, setFileActionState] = useState<FileActionState>(initialFileActionState);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const filesQuery = useGetMyCVsQuery();
  const deleteMutation = useDeleteCVFileService();
  const [select, setSelect] = useState<FileData>()
  const { data, handleClose, handleOpen, open } = useDialog();

  const onDeleteFile = () => {
    if (!fileActionState.payload.id) {
      return;
    }

    deleteMutation.mutate(
      { id: fileActionState.payload.id },
      {
        onSuccess: () => {
          clearFileActionState();
          filesQuery.refetch();
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, {
            variant: 'error',
          });
        },
      }
    );
  };
  const clearFileActionState = () => {
    setFileActionState(initialFileActionState);
  };

  const filesData = array<any>(filesQuery.data?.results);

  if (filesQuery.isError)
    return <Alert severity="error">{(filesQuery.error as any)?.message}</Alert>;

  if (!filesData) return <Alert severity="warning">{t('Not uploaded any file')}</Alert>;

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleSelect = (file: any) => {
    setSelect(file)
  }


  return (
    <div
      id='account-cv'
      className='p-[32px] rounded-[13px] '
      style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
    >
      <CvAutoFillDialog
        data={data}
        open={open}
        onClose={handleClose}
      />
      <p className="text text-xl font-semibold mb-5">
        {t('CV Files')}
      </p>
      <CVUpload onUploadCompleted={() => filesQuery.refetch()} />
      <EditFilenameDialog
        open={fileActionState.isOpen && fileActionState.mode === 'edit'}
        onClose={clearFileActionState}
        onSuccess={() => {
          filesQuery.refetch();
          clearFileActionState();
        }}
        id={fileActionState.payload.id}
        title={fileActionState.payload.title}
      />
      <ConfirmDialog
        title={t('Delete file')}
        onClose={clearFileActionState}
        open={fileActionState.isOpen && fileActionState.mode === 'delete'}
        onConfirm={() => {
          onDeleteFile();
        }}
        content={
          <>
            {t('The file will delete. Do you want to continue?')}
            <Box display="flex" flexDirection="row" alignItems="start" mt={2}>
              <Typography variant="body2" color="error">
                {t('warningCv')}
              </Typography>
            </Box>
          </>
        }
        isLoading={deleteMutation.isLoading}
        confirmColor="red"
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setFileActionState((prev) => ({ ...prev, isOpen: true, mode: 'edit' }));
          }}
        >
          {t('Edit file name')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setFileActionState((prev) => ({ ...prev, isOpen: true, mode: 'delete' }));
          }}
          sx={{ color: 'red' }}
        >
          {t('Delete')}
        </MenuItem>
      </Menu>
      <Box
        sx={{ my: 3 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[70px] relative overflow-hidden"
      >
        {filesData.map((file, ind) => {

          return (
            <div
              onClick={() => handleSelect(file)}
              className={`border rounded-md px-4 py-4 bg-slate-50 cursor-pointer ${select?.fileKey === file?.fileKey ? 'border-blue-500' : 'border-transparent'}`}
              key={file?._id}
            >
              <Tooltip title={file?.title}>
                <Chip
                  label={file?.title}
                  size="small"
                  sx={{ maxWidth: '100%' }}
                  className="!bg-slate-200 text-ellipsis"
                />
              </Tooltip>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-x-2">
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
                </div>
                <div className="flex items-center gap-x-2">
                  <DownloadCVButton
                    id={file?._id}
                    fileName={`${file?.title}.pdf`}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setFileActionState({
                        isOpen: false,
                        mode: 'initial',
                        payload: {
                          id: file?._id,
                          title: file?.title,
                        },
                      });
                    }}
                  >
                    <MoreVertOutlined />
                  </IconButton>
                </div>
              </div>
            </div>
          );
        })}
        {filesQuery.isFetching ? (
          <div className="bg-slate-100 bg-opacity-50 absolute inset-0 flex items-center justify-center">
            <CircularProgress />
          </div>
        ) : null}
      </Box>
      <div className='flex gap-2 items-center justify-end'>
        <Button
          disabled={!select}
          variant='contained'
          onClick={() => setSelect({} as any)}
        >{t('removeSelection')}</Button>
        <Button
          disabled={!select}
          onClick={() => handleOpen(select)}
          variant='outlined'
        >{t('autofill')}</Button>
      </div>

    </div>

  );
}
