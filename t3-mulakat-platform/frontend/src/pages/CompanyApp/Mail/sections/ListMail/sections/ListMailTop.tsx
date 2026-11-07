import {
    UnarchiveOutlined,
    ArchiveOutlined,
    DeleteOutlined,
    MarkEmailReadOutlined,
    MarkEmailUnreadOutlined,
    Refresh,
} from '@mui/icons-material';
import { Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { useSearchParams } from 'react-router-dom';

const MailActions = [
    {
        label: 'Mark as read',
        icon: <MarkEmailReadOutlined fontSize="small" />,
        action: 'markAsRead',
    },
    {
        label: 'Mark as unread',
        icon: <MarkEmailUnreadOutlined fontSize="small" />,
        action: 'markAsUnread',
    },
    {
        label: 'Archive',
        icon: <ArchiveOutlined fontSize="small" />,
        action: 'archive',
    },
    {
        label: 'Unarchive',
        icon: <UnarchiveOutlined fontSize="small" />,
        action: 'unarchive',
    },
    {
        label: 'Delete',
        icon: <DeleteOutlined fontSize="small" />,
        action: 'delete',
    },
];

export default function ListMailTop({
    counts,
    refetch,
    isFetching,
    selectedRowIds,
    handleBulkAction,
    isBulkActionRunning,
}: {
    isFetching: boolean;
    refetch: any;
    counts: { all: number; unread: number };
    selectedRowIds: string[];
    handleBulkAction: (action: string) => void;
    isBulkActionRunning: boolean;
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();

    const activeTab = searchParams.get('activeTab') || 'inbox';
    const status = searchParams.get('status') || 'all';

    const hasSelected = selectedRowIds.length > 0;
    return (
        <Stack
            p={2}
            flexDirection={'row'}
            gap={0.5}
            alignItems={'center'}
            justifyContent={'space-between'}
            sx={{ position: 'relative', width: '100%' }}
        >
            {hasSelected && (
                <Stack
                    flexDirection={'row'}
                    alignItems={'center'}
                    sx={{
                        px: 2,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: '#fff',
                        zIndex: 40,
                        borderBottomColor: 'neutral.200',
                        borderBottomWidth: '1px',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        width={125}
                    >
                        {selectedRowIds.length} selected
                    </Typography>
                    <Stack
                        flexDirection={'row'}
                        gap={2}
                        alignItems={'center'}
                    >
                        {MailActions.map((action) => {
                            return (
                                <Tooltip
                                    title={t(action.label)}
                                    key={action.action}
                                >
                                    <IconButton
                                        disabled={isBulkActionRunning}
                                        onClick={() => {
                                            handleBulkAction(action.action);
                                        }}
                                        size="small"
                                    >
                                        {action.icon}
                                    </IconButton>
                                </Tooltip>
                            );
                        })}
                        {isBulkActionRunning && (
                            <CircularProgress
                                size={20}
                                thickness={4}
                            />
                        )}
                    </Stack>
                </Stack>
            )}
            <div className='w-full flex flex-row gap-1 items-center'>
                {activeTab !== 'sent' ? (
                    [
                        { label: t('All'), value: 'all' },
                        { label: t('Unread'), value: 'unread' },
                    ].map((setting, index) => {
                        const count = counts[setting.value as keyof typeof counts];
                        const isActive = setting.value === status;
                        const activeColor = isActive ? 'text-[#E31E24]' : 'text-black'

                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    setSearchParams((prev) => {
                                        if (setting.value === 'all') {
                                            prev.delete('status');
                                        } else prev.set('status', setting.value);
                                        prev.delete('page');
                                        return prev;
                                    });
                                }}

                                className={`px-2 cursor-pointer font-satoshi font-medium text-[14px] ${activeColor}`}
                            >
                                <p>{`${setting.label}${count ? ` (${count})` : ''}`}</p>
                            </div>
                        );
                    })
                ) : (
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                    >
                        {t('Sent Mails')}
                    </Typography>
                )}

                <div className='ml-auto'>
                    <IconButton
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className={cn({
                            'animate-spin': isFetching,
                        })}
                        size="small"
                    >
                        <Refresh fontSize="small" />
                    </IconButton>
                </div>
            </div>
        </Stack>
    );
}
