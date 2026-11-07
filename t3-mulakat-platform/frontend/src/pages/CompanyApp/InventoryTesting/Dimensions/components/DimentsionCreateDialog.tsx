import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
    Typography,
    Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { usePostNewDimensionMutation, useGetAllDimensionsQuery, useUpdateDimensionMutation } from 'src/hooks/useServices/useDimensionServices';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { array } from 'src/utils';

interface Dimension {
    _id: string;
    dimensionCode: string;
    name: {
        tr: string;
        en: string;
    };
    description: {
        tr: string;
        en: string;
    };
    parentDimensionId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DimensionFormData {
    dimensionCode: string;
    parentDimensionId: string;
    name: {
        tr: string;
        en: string;
    };
    description: {
        tr: string;
        en: string;
    };
    isActive: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    initialValues?: DimensionFormData;
    dimensionId?: string;
    onSuccess?: () => void;
}

const DimensionCreateDialog = ({ open, onClose, mode = 'create', initialValues: editInitialValues, dimensionId, onSuccess }: Props) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = usePostNewDimensionMutation();
    const updateMutation = useUpdateDimensionMutation();

    // Get all dimensions for parent selection (only main dimensions)
    const dimensionsQuery = useGetAllDimensionsQuery('parentDimensionId=null');
    const parentDimensions = array<Dimension>(dimensionsQuery.data)
        .filter(d => !d.parentDimensionId)
        .filter(d => d._id !== dimensionId); // exclude self when editing

    const defaultInitialValues: DimensionFormData = {
        dimensionCode: '',
        parentDimensionId: '',
        name: {
            tr: '',
            en: ''
        },
        description: {
            tr: '',
            en: ''
        },
        isActive: true
    };

    const initialValues = editInitialValues || defaultInitialValues;

    const validationSchema = yup.object({
        dimensionCode: yup
            .string()
            .required(t('Dimension code is required'))
            .min(2, t('Dimension code must be at least 2 characters'))
            .max(20, t('Dimension code must be at most 20 characters'))
            .matches(/^[A-Z0-9_]+$/, t('Dimension code must contain only uppercase letters, numbers, and underscores')),
        name: yup.object({
            tr: yup
                .string()
                .required(t('Turkish name is required'))
                .min(2, t('Name must be at least 2 characters'))
                .max(100, t('Name must be at most 100 characters')),
            en: yup
                .string()
                .required(t('English name is required'))
                .min(2, t('Name must be at least 2 characters'))
                .max(100, t('Name must be at most 100 characters'))
        }),
        description: yup.object({
            tr: yup
                .string()
                .required(t('Turkish description is required'))
                .min(10, t('Description must be at least 10 characters'))
                .max(500, t('Description must be at most 500 characters')),
            en: yup
                .string()
                .required(t('English description is required'))
                .min(10, t('Description must be at least 10 characters'))
                .max(500, t('Description must be at most 500 characters'))
        }),
        parentDimensionId: yup.string().nullable(),
        isActive: yup.boolean()
    });

    const handleSubmit = async (values: DimensionFormData, helpers: FormikHelpers<DimensionFormData>) => {
        try {
            const payload = {
                ...values,
                parentDimensionId: values.parentDimensionId || null
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
            } else {
                // edit mode
                if (!dimensionId) {
                    throw new Error('dimensionId is required for edit mode');
                }
                await updateMutation.mutateAsync({ id: dimensionId, payload });
            }
            queryClient.invalidateQueries(['dimensions']);
            toast.success(t('Dimension created successfully'));
            onClose();
            helpers.resetForm();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.message || t('An error occurred while creating dimension');
            toast.error(errorMessage);
        } finally {
            helpers.setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '600px' }
            }}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue, resetForm }) => (
                    <>
                        <DialogTitle>
                            <Typography variant="h5" component="div">
                                {mode === 'create' ? t('Create New Dimension') : t('Edit Dimension')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {mode === 'create' ? t('Create a new personality inventory dimension') : t('Edit the selected dimension')}
                            </Typography>
                        </DialogTitle>

                        <DialogContent>
                            <Stack component="form" onSubmit={handleSubmit} spacing={3} sx={{ mt: 1 }}>
                                {/* Basic Information */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Basic Information')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Dimension Code')}
                                                name="dimensionCode"
                                                value={values.dimensionCode}
                                                onChange={handleChange}
                                                error={touched.dimensionCode && Boolean(errors.dimensionCode)}
                                                helperText={touched.dimensionCode && errors.dimensionCode}
                                                placeholder="e.g., EXT_01, AGRE_02"
                                                InputProps={{
                                                    style: { fontFamily: 'monospace' }
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Parent Dimension')}</InputLabel>
                                                <Select
                                                    value={values.parentDimensionId}
                                                    label={t('Parent Dimension')}
                                                    onChange={(e) => setFieldValue('parentDimensionId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>{t('None (Main Dimension)')}</em>
                                                    </MenuItem>
                                                    {parentDimensions.map((dimension: Dimension) => (
                                                        <MenuItem key={dimension._id} value={dimension._id}>
                                                            <div>
                                                                <Typography variant="body2" component="div">
                                                                    {dimension.dimensionCode} - {dimension.name.tr}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {dimension.name.en}
                                                                </Typography>
                                                            </div>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.isActive}
                                                        onChange={(e) => setFieldValue('isActive', e.target.checked)}
                                                    />
                                                }
                                                label={t('Active')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <Divider />

                                {/* Multilingual Names */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Names')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Name (Turkish)')}
                                                name="name.tr"
                                                value={values.name.tr}
                                                onChange={handleChange}
                                                error={touched.name?.tr && Boolean(errors.name?.tr)}
                                                helperText={touched.name?.tr && errors.name?.tr}
                                                placeholder={t('Enter Turkish name')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Name (English)')}
                                                name="name.en"
                                                value={values.name.en}
                                                onChange={handleChange}
                                                error={touched.name?.en && Boolean(errors.name?.en)}
                                                helperText={touched.name?.en && errors.name?.en}
                                                placeholder={t('Enter English name')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <Divider />

                                {/* Multilingual Descriptions */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Descriptions')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label={t('Description (Turkish)')}
                                                name="description.tr"
                                                value={values.description.tr}
                                                onChange={handleChange}
                                                error={touched.description?.tr && Boolean(errors.description?.tr)}
                                                helperText={touched.description?.tr && errors.description?.tr}
                                                placeholder={t('Enter detailed Turkish description')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label={t('Description (English)')}
                                                name="description.en"
                                                value={values.description.en}
                                                onChange={handleChange}
                                                error={touched.description?.en && Boolean(errors.description?.en)}
                                                helperText={touched.description?.en && errors.description?.en}
                                                placeholder={t('Enter detailed English description')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ p: 3 }}>
                            <Button
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                disabled={isSubmitting}
                            >
                                {t('Cancel')}
                            </Button>
                            <LoadingButton
                                variant="contained"
                                onClick={() => handleSubmit()}
                                loading={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
                                disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
                            >
                                {mode === 'create' ? t('Create Dimension') : t('Save Changes')}
                            </LoadingButton>
                        </DialogActions>
                    </>
                )}
            </Formik>
        </Dialog>
    );
};

export default DimensionCreateDialog;