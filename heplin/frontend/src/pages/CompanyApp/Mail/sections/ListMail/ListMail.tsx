import { TablePagination } from '@mui/material';
import { ListMailTable, ListMailTop } from './sections';
import { MouseEvent } from 'react';

export default function ListMail({
    counts,
    refetch,
    isFetching,
    mails,
    pagination,
    selectedRowIds,
    handleSelectRow,
    handleBulkAction,
    isBulkActionRunning,
    onMailClick,
    activeThreadId
}: {
    mails: any[];
    isFetching: boolean;
    refetch: any;
    counts: { all: number; unread: number };
    pagination: {
        count: number;
        page: number;
        onPageChange: (e: any, page: number) => void;
    };
    selectedRowIds: string[];
    handleSelectRow: (ids: string[]) => void;
    handleBulkAction: (action: string) => void;
    isBulkActionRunning: boolean;
    onMailClick: (id: string, e: MouseEvent<HTMLTableRowElement>) => void;
    activeThreadId?: string;
}) {
    return (
        <>
            <ListMailTop
                refetch={refetch}
                isFetching={isFetching}
                counts={counts}
                selectedRowIds={selectedRowIds}
                handleBulkAction={handleBulkAction}
                isBulkActionRunning={isBulkActionRunning}
            />
            <hr />
            <ListMailTable
                items={mails}
                handleSelectRow={handleSelectRow}
                selectedRowIds={selectedRowIds}
                isFetching={isFetching}
                onRowClick={(id, e) => {
                    onMailClick(id, e)
                }}
            />
            <TablePagination
                component="div"
                count={pagination.count}
                onPageChange={pagination.onPageChange}
                onRowsPerPageChange={() => { }}
                page={pagination.page}
                rowsPerPage={25}
                rowsPerPageOptions={[25]}
                sx={{ width: '100%', ml: 'auto', mt: 'auto', pr: '20px !important' }}
            />

        </>
    );
}
