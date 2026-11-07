// import { useTranslation } from 'react-i18next';
// import DepartmentForm from './DepartmentForm';
// import { useDeleteDepartmentMutation, useGetOneDepartmentQuery, useUpdateDepartmentMutation } from 'src/hooks/useServices';
// import { useSnackbar } from 'notistack';
// import { Button, Stack } from '@mui/material';
// import { Delete } from '@mui/icons-material';
// import { ConfirmAction } from 'src/components/shared';

// export default function UpdateDepartment({
//     id,
//     isVisible,
//     onClose,
// }: {
//     id?: string
//     onClose: (isSuccess?: boolean) => void;
//     isVisible: boolean;
// }) {
//     const deparmentQuery = useGetOneDepartmentQuery({ id: id! });

//     const departmentData = deparmentQuery.data;

//     const updateDepartmentMutation = useUpdateDepartmentMutation();

//     const deleteDepartmentMutation = useDeleteDepartmentMutation();
//     const { enqueueSnackbar } = useSnackbar();

//     const { t } = useTranslation();
//     return (
//         <DepartmentForm
//             isVisible={isVisible}
//             onClose={onClose}
//             header={{
//                 title: <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"space-between"}>
//                     <div>
//                         {departmentData?.name ? `${departmentData?.name} - ${t('department')}` : ""}
//                     </div>
//                     <ConfirmAction onConfirm={async () => {
//                         return deleteDepartmentMutation.mutateAsync({
//                             id: id!,
//                         }, {
//                             onSuccess: () => {
//                                 enqueueSnackbar(t('Department deleted successfully'), { variant: 'success' });
//                                 onClose(true);
//                             },
//                             onError: (error: any) => {
//                                 enqueueSnackbar(error?.response?.data?.message || error?.message, { variant: 'error' });
//                             }
//                         })
//                     }}>
//                         <Button size="small" color='error' startIcon={<Delete />}>
//                             {t('Delete')}
//                         </Button>
//                     </ConfirmAction>
//                 </Stack>,
//                 actionText: t('update'),
//             }}
//             isFetching={deparmentQuery.isLoading}
//             onSubmit={async (vals, helpers) => {
//                 try {
//                     await updateDepartmentMutation.mutateAsync({ id: id!, payload: vals });
//                     enqueueSnackbar(t('Department updated successfully'), { variant: 'success' });
//                     onClose(true);
//                 } catch (error: any) {
//                     enqueueSnackbar(error?.response?.data?.message || error?.message, { variant: 'error' });
//                 } finally {
//                     helpers.setSubmitting(false);
//                 }
//             }}
//             initialValues={{
//                 name: departmentData?.name || '',
//                 description: departmentData?.description || '',
//             }}
//         />
//     );
// }
