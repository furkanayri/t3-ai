import { Box, CircularProgress, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/seo';
import { useGetAllPostingChannels } from 'src/hooks/useServices/admin';
import { ChannelsList } from './sections';
import { PostingChannel } from 'src/types';
import { array } from 'src/utils';
import { useRef } from 'react';
import { useAuth } from 'src/providers';

export function Component() {
    const { t } = useTranslation();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const { activeTenantId } = useAuth()

    const postingChannelsQuery = useGetAllPostingChannels({ adminTenantId: activeTenantId ?? '', query: '' })
    const postingChannels = array<PostingChannel>(postingChannelsQuery?.data?.results)

    return (
        <>
            <Seo title="Posting Channels: Channels List" />
            <Divider />
            <Box
                component="main"
                ref={rootRef}
                sx={{
                    flexGrow: 1,
                    py: 8,
                    px: 8,
                }}
            >
                <Container maxWidth={'xl'}>
                    <Grid
                        container
                        spacing={{ xs: 3, lg: 4 }}
                    >
                        <Grid xs={12}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={4}
                            >
                                <Typography variant="h4">{t('Channels')}</Typography>
                            </Stack>
                        </Grid>
                        <Grid xs={12}>
                            <div className='flex flex-col gap-4 py-8'>
                                {postingChannelsQuery?.isLoading ? <CircularProgress sx={{ width: "100%", my: 4 }} /> :
                                    <ChannelsList items={postingChannels} />
                                }
                            </div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

        </>
    )
}

Component.displayName = "Posting Channels"