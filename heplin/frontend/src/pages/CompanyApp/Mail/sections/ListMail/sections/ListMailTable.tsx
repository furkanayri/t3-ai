import {
    Alert,
    Avatar,
    Checkbox,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import { format, isValid } from 'date-fns';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

export default function ListMailTable({
    items,
    selectedRowIds,
    isFetching,
    handleSelectRow,
    onRowClick
}: {
    items: any[];
    selectedRowIds: string[];
    isFetching: boolean;
    handleSelectRow: (ids: string[]) => void;
    onRowClick?: (id: string, e: MouseEvent<HTMLTableRowElement>) => void
}) {
    const { t } = useTranslation();
    const today = new Date();
    const dayOfToday = today.getDay();
    const yearOfToday = today.getFullYear();

    const uniqueItems = items.reduce((acc, mail) => {
        const existingMail = acc.find((m: any) => m.threadId === mail.threadId);
        if (!existingMail) {
            acc.push(mail);
        }
        return acc;
    }, [] as any[]);

    return (
        <Stack className="relative">
            <Table size="small">
                <TableBody>
                    {isFetching ? (
                        <CircularProgress size={20} sx={{ m: 4 }} />
                    ) : (uniqueItems.length === 0) ? (
                        <Alert severity="warning" sx={{ m: 4 }}>
                            {t('NoEmailsFound')}
                        </Alert>
                    ) : (uniqueItems?.map((item: any) => {
                        const senderName = item?.from?.name || item?.from?.address || 'Unknown';
                        const isSeen = !!item?.isSeen;

                        const mailDate = isValid(new Date(item?.date)) ? new Date(item?.date) : new Date("1800-01-01T00:00:00.000Z");

                        const isSelected = selectedRowIds.includes(item._id);

                        return (
                            <TableRow
                                onClick={(e) => onRowClick?.(item._id, e)}
                                key={item._id}
                                sx={{
                                    cursor: 'pointer',
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    backgroundColor: isSeen ? '#fbfbfe' : 'inherit',
                                    transition: 'all 200ms',
                                }}
                                selected={isSelected}
                            >
                                <TableCell
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    sx={{ pr: 0 }}
                                >
                                    <Checkbox
                                        size="small"
                                        color="primary"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            const ids = selectedRowIds.includes(item._id)
                                                ? selectedRowIds.filter((id) => id !== item._id)
                                                : [...selectedRowIds, item._id];
                                            handleSelectRow(ids);
                                        }}
                                    />
                                </TableCell>
                                <TableCell
                                    width={250}
                                    padding="none"
                                    scope="row"
                                >
                                    <Stack
                                        flexDirection={'row'}
                                        alignItems={'center'}
                                        gap={1}
                                    >
                                        <Avatar sx={{ width: 32, height: 32 }}>{senderName?.[0]?.toUpperCase()}</Avatar>
                                        <Typography
                                            noWrap={true}
                                            sx={{ maxWidth: 80 }}
                                            fontWeight={isSeen ? 400 : 600}
                                            fontSize={'14px'}
                                            minWidth={'6vw'}
                                        >
                                            {senderName}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell
                                    width={'100%'}
                                    sx={{ maxWidth: '40vw' }}
                                >
                                    <Stack
                                        width={'100%'}
                                        flexDirection={'row'}
                                        alignItems={'center'}
                                        gap={1}
                                        flex={1}
                                    >
                                        <Stack
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 5,
                                                backgroundColor: !isSeen ? 'primary.main' : 'transparent',
                                            }}
                                        ></Stack>
                                        <Stack>
                                            <Typography
                                                sx={{ width: '100%' }}
                                                fontSize={14}
                                                fontWeight={isSeen ? 400 : 600}
                                            >
                                                {item?.subject || t('No Subject')}
                                            </Typography>
                                        </Stack>
                                        <Stack
                                            flex={1}
                                            sx={{ overflow: 'hidden', maxWidth: '100%' }}
                                        >
                                            <Typography
                                                sx={{ width: '100%' }}
                                                fontSize={12}
                                                color={'text.secondary'}
                                                noWrap
                                            >
                                                {item?.text}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack>
                                        <Typography
                                            noWrap
                                            variant="caption"
                                            color={!!isSeen ? 'text.secondary' : 'inherit'}
                                        >
                                            {mailDate.getDay() === today.getDay()
                                                ? format(mailDate, 'HH:mm')
                                                : mailDate.getFullYear() === today.getFullYear()
                                                    ? format(mailDate, 'MMM dd')
                                                    : format(mailDate, 'dd/MM/yyyy')}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    }))}
                </TableBody>
            </Table>
        </Stack>
    );
}
