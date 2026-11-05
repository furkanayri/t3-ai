import { Button, Card, CardContent, CardHeader, Tooltip } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { HTMLRender } from 'src/components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ArchiveJobDescription(job: any) {
    const { t } = useTranslation();



    return (
        <Card>
            <CardHeader
                title={t("Description")}
                action={
                    <Tooltip title="Edit description">
                        <Link
                            to={'edit/content'}
                            className="flex items-center"
                        >
                            {/* <Button
                                size="small"
                                color="inherit"
                                sx={{ color: 'text.secondary' }}
                                startIcon={<EditOutlined />}
                            >
                                {t('edit')}
                            </Button> */}
                        </Link>
                    </Tooltip>
                }
            />
            <CardContent sx={{ pt: 1 }}>
                <div>
                    <HTMLRender html={job?.job?.content} />
                </div>
            </CardContent>
        </Card>
    );
}
