import {
    Alert,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useGetPostingChannelByTenantId } from 'src/hooks/useServices/admin';
import { useAuth } from 'src/providers';
import { JobForm } from 'src/types/jobPost';

import { array } from 'src/utils';

const colorMapper: any = {
    "active": "primary",
    "inactive": "warning",
    "pending": "default"
}

const SelectChannel = () => {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const { values, setFieldValue, errors, touched } = useFormikContext<JobForm>();
    const selectedTenantId = useMemo(() => searchParams.get('tenantId'), [searchParams]);

    const postingChannelsQuery = useGetPostingChannelByTenantId({ tenantId: selectedTenantId || "" });
    const postingChannels = array(postingChannelsQuery.data?.results)


    return (
        <Card>
            <CardContent>
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <Typography variant="h6">{t("selectChannel")}</Typography>
                        <Typography
                            mt={2}
                            color="text.secondary"
                            variant="body2"
                        >
                            {t("selectChannelDescription")}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={8}
                    >
                        <div className='flex justify-center'>
                            <Stack width={1000}>
                                {
                                    !selectedTenantId ?
                                        <Alert severity="info">{t("selectTanentToSeeChannels")}</Alert> :
                                        postingChannelsQuery.isLoading ?
                                            <div className='text-end'>
                                                <CircularProgress />
                                            </div> :
                                            postingChannels.map((channel: any) => (
                                                <div key={channel?._id} className='flex justify-between items-center'>
                                                    <div style={{ flexBasis: '40%' }}>
                                                        <span>{channel.name}</span>
                                                    </div>
                                                    <div style={{ flexBasis: '20%', textAlign: 'center' }}>
                                                        <Chip
                                                            size="small"
                                                            color={colorMapper[channel?.status]}
                                                            label={channel?.status}
                                                        />
                                                    </div>
                                                    <div style={{ flexBasis: '20%', textAlign: 'right' }}>
                                                        <Switch
                                                            sx={{ mt: '0 !important' }}
                                                            onChange={(e, checked) => {
                                                                const rest = values.publishedChannels?.filter((item: any) => item.channelId !== channel?._id)
                                                                setFieldValue('publishedChannels', [
                                                                    ...(rest ?? []),
                                                                    {
                                                                        channelId: channel?._id,
                                                                        status: checked ? 'published' : 'draft'
                                                                    }
                                                                ])
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                }
                            </Stack>
                        </div>


                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )

}

export default SelectChannel