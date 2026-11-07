// import { Alert, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
// import { useTranslation } from 'react-i18next';
// import { useDialog } from 'src/hooks/use-dialog';
// import { useGetAllDepartmentsQuery } from 'src/hooks/useServices';
// import { array } from 'src/utils';
// import CreateDepartment from './CreateDepartment';
// import UpdateDepartment from './UpdateDepartment';
// import { Add } from '@mui/icons-material';
// import { CustomButton, Paginate } from 'src/components/shared';
// import { useMemo } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import DepartmentCard from './DepartmentCard';

// export function ListDepartments() {
//     const { t } = useTranslation();
//     const dialog = useDialog<any>();
//     const [searchParams, setSearchParams] = useSearchParams()

//     const pageSizes = [4, 8, 12, 24]
//     const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
//     const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
//     const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

//     // TODO: Implement pagination to server
//     const departmentsQuery = useGetAllDepartmentsQuery(query);

//     const departmentsData = array<any>(departmentsQuery.data?.results);

//     const handleClose = (isSuccess?: boolean) => {
//         dialog.handleClose();
//         if (isSuccess) {
//             departmentsQuery.refetch();
//         }
//     }

//     const handleOpen = ({ mode, id = "" }: { mode: 'create' | 'update', id?: string }) => {
//         dialog.handleOpen({ mode: mode, id: id })
//     }

//     return (
//         <div>
//             <CreateDepartment isVisible={dialog.data?.mode === "create"} onClose={handleClose} />
//             <UpdateDepartment id={dialog.data?.id} isVisible={dialog.data?.mode === "update"} onClose={handleClose} />
//             <div className='flex flex-col'>
//                 <div className='flex justify-between mb-[30px]'>
//                     <p className='text-2xl font-medium'>{t('departments')}</p>
//                     <CustomButton
//                         startIcon={<Add fontSize='small' />}
//                         onClick={() => handleOpen({ mode: 'create' })}
//                     >
//                         {t('new_department')}
//                     </CustomButton>
//                 </div>

//                 {departmentsQuery.isLoading ? (
//                     <CircularProgress />
//                 ) : departmentsData.length === 0 ? (
//                     <Alert>{t('No departments found')}</Alert>
//                 ) : (
//                     <>
//                         <div className='py-[22px] rounded-[13px]'
//                             style={{
//                                 boxShadow: "0px 4px 14.8px 0px #A6A6A640"
//                             }}
//                         >
//                             <Paginate
//                                 isFetching={departmentsQuery.isFetching || departmentsQuery.isPreviousData}
//                                 pageSizes={pageSizes}
//                                 count={departmentsQuery?.data?.count}
//                             >
//                                 <Table>
//                                     <TableHead>
//                                         <TableRow
//                                             style={{ fontWeight: 500, fontSize: "14px" }}
//                                             sx={{
//                                                 "& .MuiTableCell-root": {
//                                                     fontSize: "14px",
//                                                     fontWeight: "500",
//                                                     fontFamily: "Satoshi, sans-serif",
//                                                     textTransform: "capitalize",
//                                                 }
//                                             }}
//                                         >
//                                             <TableCell>{t('name')}</TableCell>
//                                             <TableCell>{t('description')}</TableCell>
//                                             <TableCell align='center'></TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {
//                                             departmentsData?.map((department: any, ind: number) => (
//                                                 <DepartmentCard
//                                                     key={department?._id + ind}
//                                                     department={department}
//                                                     handleOpen={handleOpen}
//                                                 />
//                                             ))
//                                         }
//                                     </TableBody>
//                                 </Table>
//                             </Paginate>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }
