import { MoreVertOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
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
import { useFormikContext } from "formik"
import { DownloadFileButton } from 'src/components';
import { ConfirmDialog, FileUpload } from 'src/components/shared';
import { useAuth } from 'src/providers';
import { array } from 'src/utils';
import EditFilenameDialog from './EditFilenameDialog';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';


type FileActionState = {
  isOpen: boolean;
  mode: 'edit' | 'delete' | 'initial';
  payload: {
    id: null | string;
    name: null | string;
    key: null | string;
  };
};

const initialFileActionState: FileActionState = {
  isOpen: false,
  mode: 'edit',
  payload: {
    id: null,
    key: "",
    name: '',
  },
};
export default function CertificateFiles() {
  const { t } = useTranslation();
  const [fileActionState, setFileActionState] = useState<FileActionState>(initialFileActionState);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [isUpdated, setIsUpdated] = useState(false);
  const { setFieldValue, values } = useFormikContext<any>()

  const filesData = array<any>(values.files)

  const onDeleteFile = () => {
    if (!fileActionState.payload.key) {

      return;
    }

    const copyFiles = JSON.parse(JSON.stringify(filesData))

    setFieldValue("files", copyFiles.filter((_f: any) => _f.fileKey !== fileActionState.payload.key))
    clearFileActionState();
    setIsUpdated(true);
  };

  const clearFileActionState = () => {
    setFileActionState(initialFileActionState);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleFileNameUpdate = ({ fileName }: { fileName: string }) => {
    const copyFiles = JSON.parse(JSON.stringify(filesData))
    const findIndex = copyFiles.findIndex((f: any) => f.fileKey === fileActionState.payload.key)
    if (findIndex === -1) {
      return
    }

    copyFiles[findIndex].fileName = fileName

    setFieldValue("files", copyFiles)
    clearFileActionState();
    setIsUpdated(true);
  }

  const handleFileUpload = (key: string) => {
    const copyFiles = JSON.parse(JSON.stringify(filesData))
    copyFiles.push({
      fileName: "Untitle Certificate",
      fileKey: key,
      uploadDate: new Date()
    })
    setFieldValue("files", copyFiles)
    setIsUpdated(true);
  }



  return (
    <Card sx={{ py: 0 }}>
      <CardContent
        sx={{
          px: {
            xs: 1,
            sm: 2,
          },
        }}
      >
        <Typography
          gutterBottom
          variant="h5"
          sx={{ pb: 3 }}
        >
          {t('Certificate Files')}
        </Typography>
        {isUpdated && (
          <Alert severity="warning">
            {t('The document file has been modified.Please click on the save button')}
          </Alert>
        )}
        <FileUpload
          onUploadCompleted={handleFileUpload}
        />
        <EditFilenameDialog
          open={fileActionState.isOpen && fileActionState.mode === 'edit'}
          onClose={clearFileActionState}
          onSuccess={handleFileNameUpdate}
          fileKey={fileActionState.payload.key}
          fileName={fileActionState.payload.name}
        />
        <ConfirmDialog
          title={t('Delete file')}
          onClose={clearFileActionState}
          open={fileActionState.isOpen && fileActionState.mode === 'delete'}
          onConfirm={() => {
            onDeleteFile();
          }}
          content={t('The file will delete. Do you want to continue?')}
          isLoading={false}
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
                className="border rounded-md px-4 py-4 bg-slate-50"
                key={file?._id}
              >
                <Tooltip title={file?.fileName}>
                  <Chip
                    label={file?.fileName}
                    size="small"
                    sx={{ maxWidth: '100%' }}
                    className="!bg-slate-200 text-ellipsis"
                  />
                </Tooltip>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-x-2">
                    <Tooltip title={new Date(file.uploadDate).toLocaleString()}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                      >
                        {isValid(new Date(file.uploadDate))
                          ? intlFormatDistance(new Date(file.uploadDate), new Date(), {
                            numeric: 'always',
                          })
                          : null}
                      </Typography>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <DownloadFileButton
                      fileKey={file?.fileKey}
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
                            name: file?.fileName,
                            key: file?.fileKey
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
        </Box>
      </CardContent>
    </Card>
  );
}
