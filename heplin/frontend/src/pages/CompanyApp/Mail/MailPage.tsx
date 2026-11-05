import { Seo } from 'src/components/seo';
import { useBulkMailActionMutation, useGetAllMailsQuery } from 'src/hooks/useServices';
import { PageHeader } from './sections';
import { array } from 'src/utils';
import MailListTabs from './sections/MailListTabs';
import ListMail from './sections/ListMail';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { NewMail } from 'src/components/shared';
import { useTranslation } from 'react-i18next';

export function Component() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
    const status = searchParams.get('status') || 'all';
    const page = Number(searchParams.get('page')?.toString()) || 0;
    const folder = searchParams.get('activeTab') || 'inbox';

    const query = `status=${status}&page=${page + 1}&folder=${folder}`;

    const bulkAction = useBulkMailActionMutation();

    const mailsQuery = useGetAllMailsQuery({ query });

    const uniqueMails = array<any>(mailsQuery.data?.results)
        .reduce((acc, mail) => {
            const existingMail = acc.find((m: any) => m.threadId === mail.threadId);
            if (!existingMail) {
                acc.push(mail);
            }
            return acc;
        }, [] as any[]);

    const counts = {
        all: uniqueMails.length,
        unread: uniqueMails.filter((mail: any) => !mail.isSeen).length,
    };

    const senderMailAddress = mailsQuery.data?.senderMailAddress;

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
            <div className='pr-[55px]'>
                <PageHeader />
                <div className='flex flex-row items-start gap-2 py-[22px] rounded-[13px] mt-[20px]'
                    style={{
                        boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                    }}
                >
                    <MailListTabs
                        mailAddress={senderMailAddress}
                        handleClearRowSelection={() => setSelectedRowIds([])}
                    />
                    <div className='min-h-[252px] flex flex-col items-start flex-grow gap-2'>
                        <ListMail
                            counts={counts}
                            isFetching={mailsQuery.isFetching}
                            mails={uniqueMails}
                            refetch={mailsQuery.refetch}
                            selectedRowIds={selectedRowIds}
                            isBulkActionRunning={bulkAction.isLoading}
                            handleBulkAction={handleBulkAction}
                            handleSelectRow={(ids: string[]) => setSelectedRowIds(ids)}
                            pagination={{
                                count: uniqueMails.length,
                                page: page,
                                onPageChange: (e: any, _page: number) => {
                                    setSearchParams((prev) => {
                                        if (_page === 0) prev.delete('page');
                                        else prev.set('page', _page.toString());
                                        return prev;
                                    });
                                },
                            }}
                            onMailClick={(id) => {
                                navigate(id);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

Component.displayName = 'MailPage';
