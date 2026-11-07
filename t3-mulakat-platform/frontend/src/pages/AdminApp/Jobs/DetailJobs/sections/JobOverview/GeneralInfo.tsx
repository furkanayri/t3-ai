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
import { useTranslation } from 'react-i18next';
import { useJobDetail } from '../../context';
import { ShowIfExist } from 'src/components';
import { Link } from 'react-router-dom';
import { EditOutlined } from '@mui/icons-material';

export default function GeneralInfo() {
  const { t, i18n } = useTranslation();
  const { job, isLoading } = useJobDetail()
  const categoryName = job?.categoryId?.name;
  const dynamicLanguage = i18n.language;
  return (
    <Card>
      <CardHeader
        title={t("generalInformation")}
        action={
          <Tooltip title={t("editGeneralInformation")}>
            <Link
              to={'edit/general-info'}
              className="flex items-center"
            >
              <Button
                size="small"
                color="inherit"
                sx={{ color: 'text.secondary' }}
                startIcon={<EditOutlined />}
              >
                {t('edit')}
              </Button>
            </Link>
          </Tooltip>
        }
      />
      <CardContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              variant="overline"
              className="font-semibold"
            >
              İlan Başlığı
            </Typography>
            <Typography
              component="div"
              variant="subtitle2"
            >
              {isLoading ? <Skeleton width="70%" /> : job?.title}
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              variant="overline"
              className="font-semibold"
            >
              Kategorileri
            </Typography>
            <div>
              <Typography
                variant="subtitle2"
                component="div"
              >
                {job?.isLoading ? (
                  <Skeleton width="40%" />
                ) : (
                  `${categoryName ?? t('noCategories')}`
                )}
              </Typography>
            </div>
          </Stack>
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              variant="overline"
              className="font-semibold"
            >
              Konumu
            </Typography>
            <Typography
              variant="subtitle2"
              className="flex gap-x-2"
            >
              <span>{t(job?.jobType)}</span>
              <span>•</span>
              <span>{t(job?.locationType)}</span>
              <span>•</span>
              {[job.data?.country?.names?.[dynamicLanguage], job?.city, job?.district].map(
                (location, ind) => (
                  <ShowIfExist
                    key={ind}
                    render={(children) => <div>{children}</div>}
                  >
                    {location}
                  </ShowIfExist>
                )
              )}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

