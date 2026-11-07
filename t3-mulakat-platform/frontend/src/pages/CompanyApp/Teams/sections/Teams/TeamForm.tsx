import { LoadingButton } from '@mui/lab';
import {
    Avatar,
    Box,
    Button,
    Chip,
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
import { array } from 'src/utils';
import { useGetAllDepartmentsQuery, useGetAllEmployeesQuery } from 'src/hooks/useServices';

export default function TeamForm({
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

    const employeesQuery = useGetAllEmployeesQuery('')
    const departmentsQuery = useGetAllDepartmentsQuery('')  // TODO without query gives build error

    const employees = array<any>(employeesQuery.data?.results)
    const departments = array<any>(departmentsQuery.data?.results);

    return (
        <Formik
            onSubmit={onSubmit}
            enableReinitialize
            initialValues={initialValues || { name: '', description: '' }}
        >
            {({ values, handleSubmit, isSubmitting, handleChange, resetForm, setFieldValue }) => (
                <Dialog
                    fullWidth
                    open={isVisible}
                    onClose={() => {
                        resetForm();
                        onClose();
                    }}
                >
                    <DialogTitle>{header.title}</DialogTitle>
                    <DialogContent sx={{ minHeight: 200 }}>
                        {isFetching ? (
                            <CircularProgress />
                        ) : (
                            <Stack
                                component="form"
                                onSubmit={handleSubmit}
                                flex={1}
                                height={"100%"}
                                spacing={1}
                                justifyContent={"space-between"}
                            >
                                <Stack spacing={2} >
                                    <TextField
                                        label={t('Title')}
                                        name="name"
                                        onChange={handleChange}
                                        value={values.name}
                                        inputProps={{ maxLength: 50 }}
                                    />
                                    <TextField
                                        multiline
                                        minRows={2}
                                        label={t('description')}
                                        name="description"
                                        onChange={handleChange}
                                        value={values.description}
                                        inputProps={{ maxLength: 150 }}
                                    />

                                    <TextField
                                        fullWidth
                                        label={t("department")}
                                        name="departmentId"
                                        value={values.departmentId ?? []}
                                        onChange={handleChange}
                                        select
                                        required
                                    >
                                        {departments.map((department: any) => (
                                            <MenuItem
                                                key={department?._id}
                                                value={department?._id}
                                            >
                                                {department?.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        label={t('employees')}
                                        name="employees"
                                        value={values.employees ?? []}
                                        onChange={(e) => {
                                            setFieldValue(
                                                'employees',
                                                typeof e.target.value === 'string'
                                                    ? e.target.value.split(',')
                                                    : Array.isArray(e.target.value)
                                                        ? e.target.value
                                                        : []
                                            );
                                        }}
                                        select
                                        SelectProps={{
                                            multiple: true,
                                            renderValue: (selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {array(values.employees).map((value, ind) => {
                                                        const employee = employees?.find((employee) => employee?._id === value)
                                                        return (
                                                            <Stack key={ind} flexDirection={"row"} bgcolor={"#f1f1f1"} sx={{ gap: 1, px: 1, py: 0.5, borderRadius: 1 }}>
                                                                <Stack>
                                                                    <Avatar sx={{ width: 20, height: 20 }} src={employee?.avatar} />
                                                                </Stack>
                                                                <Stack>
                                                                    <Typography variant="subtitle2">
                                                                        {employee?.name || "-"} {employee?.surname || "-"}
                                                                    </Typography>
                                                                    <Typography variant='body2' color="text.secondary">
                                                                        {employee?.email}
                                                                    </Typography>
                                                                </Stack>
                                                            </Stack>
                                                        )
                                                    })}
                                                </Box>
                                            ),
                                        }}
                                        required
                                    >
                                        {employees.map((employee: any) => (
                                            <MenuItem
                                                key={employee?._id}
                                                value={employee?._id}
                                            >
                                                <Stack flexDirection={"row"} gap={1}>
                                                    <Stack>
                                                        <Avatar sx={{ width: 20, height: 20 }} src={employee?.avatar} />
                                                    </Stack>
                                                    <Stack>
                                                        <Typography variant="subtitle2">
                                                            {employee?.name || "-"} {employee?.surname || "-"}
                                                        </Typography>
                                                        <Typography variant='body2' color="text.secondary">
                                                            {employee?.email}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </TextField>
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
