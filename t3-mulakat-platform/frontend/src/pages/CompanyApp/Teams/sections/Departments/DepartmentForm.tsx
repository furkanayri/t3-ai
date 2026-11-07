import { LoadingButton } from '@mui/lab';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import { Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

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

    return (
        <Formik
            onSubmit={onSubmit}
            enableReinitialize
            initialValues={initialValues || { name: '', description: '' }}
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
                                        inputProps={{ maxLength: 30 }}
                                        sx={{ mt: 1 }}
                                    />
                                    <TextField
                                        multiline
                                        minRows={2}
                                        label={t('description')}
                                        name="description"
                                        onChange={handleChange}
                                        value={values.description}
                                        inputProps={{ maxLength: 100 }}
                                    />
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
