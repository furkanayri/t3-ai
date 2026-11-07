import { Button, Card, CardContent, CardHeader, Tooltip, Typography } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { HTMLRender } from 'src/components';
import { useDetailJob } from '../../DetailJobProvider';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Description() {
  const { t } = useTranslation();
  const { jobState } = useDetailJob();

  const job = jobState.data;
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
            TANIM
          </Typography>
        }
        action={
          <Tooltip title="Edit description">
            <Link
              to={'edit/content'}
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
        <div className="text-gray-700 leading-relaxed">
          <HTMLRender html={job?.content} />
        </div>
      </CardContent>
    </Card>
  );
}
