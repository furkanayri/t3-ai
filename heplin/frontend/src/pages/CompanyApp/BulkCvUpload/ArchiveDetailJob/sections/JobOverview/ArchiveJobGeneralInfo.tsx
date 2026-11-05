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

import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetArchiveJobDetailQuery } from 'src/hooks/useServices';

export default function ArchiveJobGeneralInfo() {

    const { t, i18n } = useTranslation()
    const { id, companySlug } = useParams();
    const jobState = useGetArchiveJobDetailQuery({ id: id! });

    const job = jobState?.data?.job;

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
                <Stack spacing={3}>
                    <Stack spacing={1}>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            {t('jobTitle')}
                        </Typography>
                        <Typography
                            component="div"
                            variant="subtitle2"
                        >
                            {jobState?.data?.job?.isLoading ? <Skeleton width="70%" /> : job?.title}
                        </Typography>
                    </Stack>
                    <Stack spacing={1}>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            {t('categories')}
                        </Typography>
                        <div>
                            <Typography
                                variant="subtitle2"
                                component="div"
                            >
                                {jobState?.isLoading ? (
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
                        >
                            {t('location')}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            className="flex gap-x-2"
                        >
                            <span>{t(jobState?.data?.job?.jobType)}</span>
                            <span>•</span>
                            <span>{t(jobState?.data?.job?.locationType)}</span>
                            <span>•</span>
                            {[jobState?.data?.job?.country?.names?.[dynamicLanguage], jobState?.data?.job?.city, jobState?.data?.job?.district].map(
                                (location, ind) => (
                                    <ShowIfExist
                                        key={ind + location}
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
