import { LoadingButton } from '@mui/lab';
import {
    Avatar,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import { useGetTenantMembersQuery } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { array } from 'src/utils';

export default function DepartmentForm({
    isVisible,
    onClose,
    header,
    onSubmit,
    initialValues,
    isFetching,
}: {
    header: {
        title: ReactNode;
        actionText: string;
    };
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void;
    initialValues?: any;
    isFetching?: boolean;
}) {
    const { t } = useTranslation();

    const { activeTenantId } = useAuth()
    const tenantMembersQuery = useGetTenantMembersQuery({ tenantId: activeTenantId! })

    const tenantMembers = array<any>(tenantMembersQuery.data?.results)

    return (
        <Formik
            onSubmit={onSubmit}
            enableReinitialize
            initialValues={initialValues || { userId: "" }}
        >
            {({ values, handleSubmit, isSubmitting, handleChange, resetForm }) => (
                <Dialog
                    fullWidth
                    open={isVisible}
                    onClose={() => {
                        resetForm();
                        onClose();
                    }}
                >
                    <DialogTitle>{header.title}</DialogTitle>
                    <DialogContent >
                        {isFetching ? (
                            <CircularProgress />
                        ) : (
                            <Stack
                                component="form"
                                onSubmit={handleSubmit}
                                flex={1}
                                spacing={1}
                                justifyContent={"space-between"}
                            >
                                <Stack spacing={2} >
                                    <Stack sx={{marginTop:"10px"}}>
                                        <TextField
                                            fullWidth
                                            label={t('member')}
                                            name="userId"
                                            value={values.userId ?? null}
                                            onChange={handleChange}
                                            select
                                            required
                                        >
                                            {tenantMembers.map((member) => (
                                                <MenuItem
                                                    key={member.userId?._id}
                                                    value={member.userId?._id}
                                                    sx={{ gap: 2, flexDirection: "row" }}
                                                >
                                                    <Stack>
                                                        <Avatar src={member?.userId?.avatar} />
                                                    </Stack>
                                                    <Stack>
                                                        <Stack>
                                                            {member.userId?.name || "-"} {member?.userId?.surname || "-"}
                                                        </Stack>
                                                        <Stack>
                                                            <Typography color="text.secondary" variant='body2'>
                                                                {member?.userId?.email}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Stack>
                                </Stack>
                                <DialogActions sx={{ pt: 2 }}>
                                    <Button onClick={onClose}>{t('Cancel')}</Button>
                                    <LoadingButton
                                        variant="contained"
                                        loading={isSubmitting}
                                        type="submit"
                                    >
                                        {header.actionText}
                                    </LoadingButton>
                                </DialogActions>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </Formik>
    );
}
