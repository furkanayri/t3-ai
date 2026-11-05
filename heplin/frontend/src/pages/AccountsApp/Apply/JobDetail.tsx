import { Card, CardContent, CardHeader } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HTMLRender } from 'src/components';

export default function JobDetail({ job }: { job: any }) {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <span className="text-lg font-semibold text-gray-800">{t('jobDetails')}</span>
          </div>
        }
        sx={{ pb: 2 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <div className="prose prose-lg max-w-none">
          <HTMLRender html={job?.content} />
        </div>
      </CardContent>
    </Card>
  );
}
