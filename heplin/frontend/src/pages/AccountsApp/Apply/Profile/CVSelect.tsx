import { Edit } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DownloadCVButton } from 'src/components';
import { useGetMyCVsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';

export default function CVSelect({
  selectedCV,
  onSelectCV,
}: {
  selectedCV: null | string;
  onSelectCV: (cv: string) => void;
}) {
  const { jobId } = useParams();
  const { t } = useTranslation();

  const filesQuery = useGetMyCVsQuery({
    onSuccess: (data) => {
      if (Array.isArray(data?.results) && !selectedCV) {
        onSelectCV(data?.results?.[0]?._id);
      }
    },
    refetchOnWindowFocus: true,
  })

  const filesData = array<any>(filesQuery.data?.results);

  if (filesQuery.isLoading) return <CircularProgress />;

  if (filesQuery.isError)
    return <Alert severity="error">{(filesQuery.error as any)?.message}</Alert>;

  if (!filesData) return <Alert severity="warning">{t('Not uploaded any file')}</Alert>;

  return (
    <Card>
      <CardHeader
        title={t('CV Files')}
        action={
          <IconButton
            href={`/account?tab=cv&goBackJobId=${jobId}`}
            target="_blank"
          >
            <Edit />
          </IconButton>
        }
      ></CardHeader>
      <CardContent className=" !mt-0 !pt-0">
        <Stack
          component={RadioGroup}
          spacing={1}
        >
          {filesData.map((file) => (
            <Paper
              key={file._id}
              sx={{
                alignItems: 'flex-start',
                display: 'flex',
                p: 2,
                flex: '1 1 0%',
              }}
              variant="outlined"
            >
              <FormControlLabel
                control={<Radio />}
                key={file._id}
                sx={{
                  flex: '1 1 0%',
                  display: 'flex',
                }}
                checked={selectedCV === file._id}
                onChange={(e) => onSelectCV((e.target as any)?.value)}
                componentsProps={{
                  typography: {
                    display: 'flex',
                    flex: '1 1 0%',
                  },
                }}
                label={
                  <Box
                    sx={{
                      ml: 2,
                      justifyContent: 'space-between',
                      display: 'flex',
                      alignItems: 'center',
                      flex: '1 1 0%',
                    }}
                  >
                    <Typography variant="subtitle2">{file.title}</Typography>
                    <DownloadCVButton
                      id={file._id}
                      fileName={`${file?.title}.pdf`}
                    />
                  </Box>
                }
                value={file._id}
              />
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
