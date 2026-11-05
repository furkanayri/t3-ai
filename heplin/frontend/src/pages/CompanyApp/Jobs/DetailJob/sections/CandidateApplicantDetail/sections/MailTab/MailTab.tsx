import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Seo } from 'src/components/seo';
import { useBulkMailActionMutation, useGetAllMailsOfCandidateQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { useMemo, useState } from 'react';
import ListMail from 'src/pages/CompanyApp/Mail/sections/ListMail';
import { useCandidateDetail } from '../../CandidateApplicantDetail';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MailDetail from './MailDetail';
import { NewMail } from 'src/components/shared';
import { useNewMail } from 'src/providers';
import MailDetailComp from 'src/pages/CompanyApp/Mail/sections/MailDetailComp';

export default function MailTab() {
    const { t } = useTranslation();
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const { candidateState } = useCandidateDetail();
    const { openNewMail } = useNewMail();
    const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status') || 'all';
    const [page, setPage] = useState(0);
    const folder = 'inbox';
    const candidateId = candidateState.data?._id;
    const candidateEmail = candidateState.data?.userId?.email;
    const query = candidateId
        ? `status=${status}&page=${page + 1}&folder=${folder}&candidateId=${candidateId}`
        : '';

    const bulkAction = useBulkMailActionMutation();
    const mailsQuery = useGetAllMailsOfCandidateQuery({ query });


    const mails = array<any>(mailsQuery.data?.results)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .reduce((acc, mail) => {
            const existingMail = acc.find((m: any) => m.threadId === mail.threadId);
            if (!existingMail) {
                acc.push(mail);
            }
            return acc;
        }, [] as any[]);

    const counts = {
        all: mails.length,
        unread: mails.filter((mail: { isSeen: any; }) => !mail.isSeen).length,
    };

    const activeThreadId = useMemo(() => {
        return selectedThreadId;
    }, [selectedThreadId]);

    const senderMailAddress = mailsQuery.data?.senderMailAddress;

    const handleMailClick = (id: string) => {
        setSelectedThreadId(id);
    };

    const handleBulkAction = (action: string) => {
        bulkAction.mutate(
            { action, mailIds: selectedRowIds },
            {
                onSuccess: () => {
                    setSelectedRowIds([]);
                    mailsQuery.refetch();
                },
            }
        );
    };

    return (
        <>
            <Seo title="Mail" />
            <NewMail />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Container maxWidth={'xl'}>
                    <Stack flex={1} mt={2}>
                        <Stack mb={2} flexDirection={"row"} alignItems={"center"} justifyContent={"space-between"}>
                            <Stack>
                                <Typography variant='h6'>{t("Mailbox")}</Typography>
                                <Typography mt={1} variant='caption' color="text.secondary">
                                    {senderMailAddress}
                                </Typography>
                            </Stack>
                            <Button size='small' onClick={() => openNewMail({
                                initialTo: candidateEmail,
                                lockToField: true,
                                onSendSuccess: () => mailsQuery.refetch()
                            })}>
                                {t("New Email")}
                            </Button>
                        </Stack>
                        {activeThreadId ? (
                            <MailDetailComp
                                threadId={activeThreadId}
                                goBack={() => setSelectedThreadId(null)}
                            />
                        ) : (
                            <ListMail
                                counts={counts}
                                isFetching={mailsQuery.isFetching}
                                mails={mails}
                                refetch={mailsQuery.refetch}
                                selectedRowIds={selectedRowIds}
                                isBulkActionRunning={bulkAction.isLoading}
                                handleBulkAction={handleBulkAction}
                                handleSelectRow={(ids: string[]) => setSelectedRowIds(ids)}
                                pagination={{
                                    count: mails.length,
                                    page: page,
                                    onPageChange: (e: any, _page: number) => setPage(_page),
                                }}
                                onMailClick={handleMailClick}
                            />
                        )}

                    </Stack>
                </Container>
            </Box>
        </>
    );
}