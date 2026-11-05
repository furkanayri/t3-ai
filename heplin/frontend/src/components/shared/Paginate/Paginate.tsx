import { CircularProgress, TablePagination } from "@mui/material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

interface IProptypes {
    children: ReactNode,
    count: number,
    pageSizes?: number[],
    isFetching: boolean

}

export default function Paginate({ children, count, pageSizes = [3, 6, 12, 25, 50], isFetching }: IProptypes) {
    const [searchParams, setSearchParams] = useSearchParams()
    const { t } = useTranslation();

    const page = Number(searchParams.get('page')?.toString()) || 0
    const pageSize = Number(searchParams.get('limit')?.toString()) || pageSizes[0]
    return (
        <>
            {children}
            <div className="mt-[100px] flex gap-2 justify-end w-full items-center">
                {isFetching ? <CircularProgress size={20} color="inherit" /> : null}
                <TablePagination
                    component="div"
                    count={count || 0}
                    page={page}
                    onPageChange={(e, _page) => {
                        setSearchParams((prev) => {
                            if (_page === 0) prev.delete('page');
                            else prev.set('page', _page.toString());
                            return prev;
                        });
                    }}
                    onRowsPerPageChange={(e) => {
                        setSearchParams((prev) => {
                            const newSize = Number(e.target.value) || pageSizes[0]
                            if (!pageSizes.includes(newSize)) prev.set('limit', pageSizes[0]?.toString());
                            else prev.set('limit', newSize.toString());

                            searchParams.delete('page')
                            return prev;
                        });
                    }}
                    rowsPerPage={pageSizes.includes(pageSize) ? pageSize : pageSizes[0]}
                    rowsPerPageOptions={pageSizes}
                    labelRowsPerPage={t('rowsperpage')}
                />
            </div>
        </>
    )
}
