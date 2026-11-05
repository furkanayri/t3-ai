import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { ShowIfExist } from 'src/components';
import { useDetailJob } from '../../DetailJobProvider';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GeneralInfo() {
  const { jobState } = useDetailJob();
  const { t, i18n } = useTranslation();

  const job = jobState.data;

  const categoryName = job?.categoryId?.name;
  const dynamicLanguage = i18n.language;

  return (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }
    }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            İLAN BAŞLIĞI
          </Typography>
        }
        action={
          <Tooltip title={t("editGeneralInformation")}>
            <Link
              to={'edit/general-info'}
              className="flex items-center"
            >
              <Button
                size="small"
                sx={{
                  color: '#E31E24',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(227, 30, 36, 0.08)',
                  }
                }}
                startIcon={<EditOutlined />}
              >
                {t('edit')}
              </Button>
            </Link>
          </Tooltip>
        }
        sx={{ borderBottom: '1px solid #f0f0f0' }}
      />
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <div>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
              {jobState.isLoading ? <Skeleton width="70%" /> : job?.title}
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                KATEGORİLERİ
              </Typography>
              <Typography variant="body2" sx={{ color: '#1a1a1a', mt: 0.5 }}>
                {jobState?.isLoading ? (
                  <Skeleton width="60%" />
                ) : (
                  categoryName || t('noCategories')
                )}
              </Typography>
            </div>

            <div>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                KONUMU
              </Typography>
              <Typography variant="body2" sx={{ color: '#1a1a1a', mt: 0.5 }}>
                {jobState.isLoading ? (
                  <Skeleton width="80%" />
                ) : (
                  <>
                    {t(jobState.data?.jobType)} • {t(jobState.data?.locationType)}
                    {jobState.data?.city && ` • ${jobState.data?.country?.names?.[dynamicLanguage]}, ${jobState.data?.city}`}
                  </>
                )}
              </Typography>
            </div>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
