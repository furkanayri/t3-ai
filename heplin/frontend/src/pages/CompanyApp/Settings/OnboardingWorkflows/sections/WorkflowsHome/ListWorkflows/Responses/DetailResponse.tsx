import { ArrowBack } from '@mui/icons-material';
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { DownloadFileButton } from 'src/components';
import { ConfirmAction } from 'src/components/shared';
import { useChangeOnboardingResponseStatusMutation, useGetOnboardingResponseDetailQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';

export default function DetailResponse({
    responseId,
    goBack,
    onUpdateSuccess
}: {
    responseId: string;
    goBack: () => void;
    onUpdateSuccess: () => void
}) {
    const { t } = useTranslation();
    const responseDetailQuery = useGetOnboardingResponseDetailQuery({
        id: responseId,
    });
    const { enqueueSnackbar } = useSnackbar()

    const updateOnboardingResponseMutation = useChangeOnboardingResponseStatusMutation()

    const response = responseDetailQuery.data?.onboardingResponse;

    const responseItems = array<any>(response?.items)

    const updateStatus = (status: "accepted" | "declined") => {
        return updateOnboardingResponseMutation.mutateAsync({
            id: responseId,
            payload: {
                status
            }
        }, {
            onSuccess: () => {
                responseDetailQuery.refetch()
                onUpdateSuccess()
                enqueueSnackbar({
                    message: t("Updated successfully"),
                    variant: "success"
                })
            },
            onError: (err: any) => {
                enqueueSnackbar({
                    message: err?.response?.data?.message || err?.message,
                    variant: "error"
                })
            }
        })
    }



    return (
        <Stack
            flex={1}
            spacing={2}
        >
            <header className="flex items-center gap-x-2">
                <IconButton
                    size="small"
                    onClick={goBack}
                >
                    <ArrowBack fontSize="small" />
                </IconButton>
                <Typography variant="h6">{t('Onboarding Response Detail')}</Typography>
            </header>
            <Divider sx={{ borderColor: 'lightgray' }} />
            <Card>
                <CardContent>
                    {responseDetailQuery.isFetching ? (
                        <CircularProgress />
                    ) : !response ? (
                        <Alert>{t('No response data')}</Alert>
                    ) : (
                        <Stack spacing={3}>
                            {
                                responseItems.map((item) => {
                                    return <Stack key={item?.itemId} spacing={1}>
                                        <Typography variant='subtitle2'>
                                            {item?.title}
                                        </Typography>
                                        <Stack flexDirection={"row"}>
                                            {item?.type === "file" ? <Chip label={
                                                <Stack flexDirection="row" alignItems={"center"} gap={1}>
                                                    <div>
                                                        {item?.response}
                                                    </div>
                                                    <DownloadFileButton fileKey={item?.response} />
                                                </Stack>
                                            } /> : <Chip label={item?.response} />}
                                        </Stack>
                                    </Stack>
                                })
                            }
                            <Stack>
                                <Typography variant='subtitle2'>
                                    {t("Status")}
                                </Typography>
                                <Stack flexDirection={"row"}>
                                    <Chip label={t(response?.status)} />
                                </Stack>
                            </Stack>
                            {response?.status === "pending" && <CardActions>
                                <ConfirmAction
                                    onConfirm={() => updateStatus("accepted")}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                    >
                                        {t('Accept')}
                                    </Button>
                                </ConfirmAction>
                                <ConfirmAction
                                    onConfirm={() => updateStatus("declined")}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="error"
                                    >
                                        {t('Reject')}
                                    </Button>
                                </ConfirmAction>

                            </CardActions>}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
