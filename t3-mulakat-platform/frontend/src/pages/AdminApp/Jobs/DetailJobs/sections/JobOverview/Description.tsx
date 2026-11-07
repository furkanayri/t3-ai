import { Button, Card, CardContent, CardHeader, Tooltip } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { HTMLRender } from 'src/components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJobDetail } from '../../context';

export default function Description() {
  const { t } = useTranslation();
  const { job } = useJobDetail()
  return (
    <Card>
      <CardHeader
        title={t("Description")}
      />
      <CardContent sx={{ pt: 1 }}>
        <div>
          <HTMLRender html={job?.content} />
        </div>
      </CardContent>
    </Card>
  );
}
