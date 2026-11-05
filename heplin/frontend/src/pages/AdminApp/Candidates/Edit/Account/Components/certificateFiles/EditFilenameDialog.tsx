import { LoadingButton } from '@mui/lab';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useUpdateCVFileService } from 'src/hooks/useServices';

type EditFilenameDialogProps = {
    open: boolean;
    onClose: () => void;
    onSuccess: ({ fileName }: { fileName: string }) => void;
    fileName: string | null;
    fileKey: string | null;
};

export default function EditFilenameDialog({
    open,
    onClose,
    onSuccess,
    fileName,
    fileKey,
}: EditFilenameDialogProps) {
    const { enqueueSnackbar } = useSnackbar();

    const {
        values,
        handleChange,
        handleBlur,
        errors,
        touched,
        handleSubmit,
        setValues,
        isSubmitting,
    } = useFormik({
        initialValues: {
            fileName: fileName ?? '',
        },
        enableReinitialize: true,
        onSubmit: (values, helpers) => {
            if (!fileKey) return;
            onSuccess({ fileName: values.fileName })
        },
    });

    const handleClose = () => {
        setValues({ fileName: '' });
    };
    const { t } = useTranslation();
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            fullWidth
            aria-describedby="alert-dialog-description"
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle id="alert-dialog-title">{t('editFileTitle')}</DialogTitle>
                <DialogContent className="!pt-4">
                    <TextField
                        fullWidth
                        label={t("File Name")}
                        name="fileName"
                        value={values.fileName ?? ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched?.fileName && !!errors?.fileName}
                        helperText={touched?.fileName && errors?.fileName}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="inherit"
                        sx={{ color: 'text.secondary' }}
                        onClick={onClose}
                    >
                        {t('Cancel')}
                    </Button>
                    <LoadingButton
                        type="submit"
                        autoFocus
                        loading={isSubmitting}
                    >
                        {t('update')}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
