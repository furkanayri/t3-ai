import { Alert, Avatar, Button, Card, CardContent, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks/use-dialog';
import { useGetAllEmployeesQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import CreateEmployee from './CreateEmployee';
import { Add } from '@mui/icons-material';
import { CustomButton, Paginate } from 'src/components/shared';
import EmployeeCard from './EmployeeCard';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from 'src/providers';

export function ListEmployees() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { user } = useAuth()

    const employePageSizes = [6, 9, 12, 24]
    const employeePage = useMemo(() => Number(searchParams.get('employeepage')?.toString()), [searchParams]) || 0
    const employeeLimit = useMemo(() => Number(searchParams.get('employeelimit')?.toString()), [searchParams]) || employePageSizes[0]
    const query = useMemo(() => `page=${employeePage + 1}&limit=${employeeLimit}`, [employeePage, employeeLimit])

    const { t } = useTranslation();
    const dialog = useDialog<any>();
    const employeesQuery = useGetAllEmployeesQuery(query);

    const employeesData = array<any>(employeesQuery.data?.results);

    const handleClose = (isSuccess?: boolean) => {
        dialog.handleClose();
        if (isSuccess) {
            employeesQuery.refetch();
        }
    }
    const isManagerOrOwner = user.employee?.type === 'manager' || user.employee?.type === 'owner';
    return (
        <div>
            <CreateEmployee isVisible={dialog.data?.mode === "create"} onClose={handleClose} />
            <div className='flex flex-col'>

                <div className='flex justify-between mb-[30px]'>
                    <p className='text-2xl font-medium'>{t('employees')}</p>
                    <CustomButton
                        startIcon={<Add fontSize='small' />}
                        onClick={() => dialog.handleOpen({ mode: 'create' })}
                        disabled={!isManagerOrOwner}
                    >
                        {t('add_employee')}
                    </CustomButton>
                </div>
            </div>

            {employeesQuery.isLoading ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: '250px',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.75)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 50,
                        }}
                    >
                        <CircularProgress size={60} className="mb-4" />
                    </div>

                </div>
            ) : employeesData.length === 0 ? (
                <Alert>{t('no_employee_found')}</Alert>
            ) : (
                <>
                    <div className='py-[22px] rounded-[13px]'
                        style={{
                            boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                        }}
                    >

                        <Table>
                            <TableHead>
                                <TableRow
                                    style={{ fontWeight: 500, fontSize: "14px" }}
                                    sx={{
                                        "& .MuiTableCell-root": {
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            fontFamily: "Satoshi, sans-serif",
                                            textTransform: "capitalize",
                                        }
                                    }}
                                >
                                    <TableCell>{t('name_surname')}</TableCell>
                                    <TableCell>{t('email')}</TableCell>
                                    <TableCell>{t('action')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    employeesData.map((employee: any, ind: number) => (
                                        <EmployeeCard
                                            key={employee?._id + ind}
                                            employee={employee}
                                            employeesQueryRefecth={employeesQuery.refetch}
                                        />
                                    ))
                                }
                            </TableBody>
                        </Table>
                        <div className='mt-[100px] flex gap-2 justify-end w-full items-center'>
                            {employeesQuery?.isFetching ? <CircularProgress size={20} color="inherit" /> : null}
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={employePageSizes}
                                count={employeesQuery?.data?.count || 0}
                                labelRowsPerPage={t('rowsperpage')}
                                rowsPerPage={employePageSizes.includes(employeeLimit) ? employeeLimit : employePageSizes[0]}
                                page={employeePage}
                                onPageChange={(e, _page) => {
                                    setSearchParams((prev) => {
                                        if (_page === 0) prev.delete('employeepage');
                                        else prev.set('employeepage', _page.toString());
                                        return prev;
                                    });
                                }}
                                onRowsPerPageChange={(e) => {
                                    setSearchParams((prev) => {
                                        const newSize = Number(e.target.value) || employePageSizes[0]
                                        if (!employePageSizes.includes(newSize)) prev.set('employeelimit', employePageSizes[0]?.toString());
                                        else prev.set('employeelimit', newSize.toString());

                                        searchParams.delete('page')
                                        return prev;
                                    });
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
