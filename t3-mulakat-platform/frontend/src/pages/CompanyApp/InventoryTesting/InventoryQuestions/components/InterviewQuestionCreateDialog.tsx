import React, { useState } from 'react';
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
    Divider,
    Chip,
    Box
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

import { usePostNewInterviewQuestionMutation, useUpdateInterviewQuestionMutation } from 'src/hooks/useServices/useInterviewQuestionServices';
import { useGetAllDimensionsQuery } from 'src/hooks/useServices/useDimensionServices';
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
    isActive: boolean;
}

interface InterviewQuestionFormData {
    dimensionId: string;
    customDimensionId: string;
    scoreRange: {
        min: number;
        max: number;
    };
    question: {
        tr: string;
        en: string;
    };
    purpose: {
        tr: string;
        en: string;
    };
    order: number;
    isActive: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    initialValues?: InterviewQuestionFormData;
    questionId?: string;
    onSuccess?: () => void;
}

const InterviewQuestionCreateDialog = ({
    open,
    onClose,
    mode = 'create',
    initialValues: editInitialValues,
    questionId,
    onSuccess
}: Props) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = usePostNewInterviewQuestionMutation();
    const updateMutation = useUpdateInterviewQuestionMutation();



    // Get dimensions for selection
    const dimensionsQuery = useGetAllDimensionsQuery('isActive=true');
    const dimensions = array<Dimension>(dimensionsQuery.data);

    const defaultInitialValues: InterviewQuestionFormData = {
        dimensionId: '',
        customDimensionId: '',
        scoreRange: {
            min: 0,
            max: 100
        },
        question: {
            tr: '',
            en: ''
        },
        purpose: {
            tr: '',
            en: ''
        },
        order: 1,
        isActive: true
    };

    const initialValues = editInitialValues || defaultInitialValues;

    const validationSchema = yup.object({
        dimensionId: yup.string().nullable(),
        customDimensionId: yup.string().nullable(),
        scoreRange: yup.object({
            min: yup
                .number()
                .required(t('Minimum score is required'))
                .min(0, t('Minimum score cannot be negative'))
                .max(100, t('Minimum score cannot exceed 100')),
            max: yup
                .number()
                .required(t('Maximum score is required'))
                .min(0, t('Maximum score cannot be negative'))
                .max(100, t('Maximum score cannot exceed 100'))
                .test('greater-than-min', t('Maximum score must be greater than minimum score'),
                    function (value) {
                        return value! > this.parent.min;
                    })
        }),
        question: yup.object({
            tr: yup
                .string()
                .required(t('Turkish question is required'))
                .min(10, t('Question must be at least 10 characters'))
                .max(1000, t('Question must be at most 1000 characters')),
            en: yup
                .string()
                .required(t('English question is required'))
                .min(10, t('Question must be at least 10 characters'))
                .max(1000, t('Question must be at most 1000 characters'))
        }),
        purpose: yup.object({
            tr: yup
                .string()
                .required(t('Turkish purpose is required'))
                .min(5, t('Purpose must be at least 5 characters'))
                .max(500, t('Purpose must be at most 500 characters')),
            en: yup
                .string()
                .required(t('English purpose is required'))
                .min(5, t('Purpose must be at least 5 characters'))
                .max(500, t('Purpose must be at most 500 characters'))
        }),
        order: yup
            .number()
            .required(t('Order is required'))
            .min(1, t('Order must be at least 1'))
            .max(1000, t('Order cannot exceed 1000')),
        isActive: yup.boolean()
    });

    const handleSubmit = async (values: InterviewQuestionFormData, helpers: FormikHelpers<InterviewQuestionFormData>) => {
        try {
            const payload = {
                ...values,
                dimensionId: values.dimensionId || null,
                customDimensionId: values.customDimensionId || null
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                toast.success(t('Interview question created successfully'));
            } else {
                if (!questionId) {
                    throw new Error('questionId is required for edit mode');
                }
                await updateMutation.mutateAsync({ id: questionId, payload });
                toast.success(t('Interview question updated successfully'));
            }

            queryClient.invalidateQueries(['interviewQuestions']);
            onClose();
            helpers.resetForm();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.message ||
                t(mode === 'create' ? 'An error occurred while creating question' : 'An error occurred while updating question');
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
                sx: { minHeight: '700px', maxHeight: '90vh' }
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
                                {mode === 'create' ? t('Create New Interview Question') : t('Edit Interview Question')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {mode === 'create' ?
                                    t('Create a new personality inventory interview question') :
                                    t('Edit the selected interview question')
                                }
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
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Dimension')}</InputLabel>
                                                <Select
                                                    value={values.dimensionId}
                                                    label={t('Dimension')}
                                                    onChange={(e) => setFieldValue('dimensionId', e.target.value)}
                                                    error={touched.dimensionId && Boolean(errors.dimensionId)}
                                                >
                                                    <MenuItem value="">
                                                        <em>{t('Select Dimension')}</em>
                                                    </MenuItem>
                                                    {dimensions.map((dimension) => (
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
                                                {touched.dimensionId && errors.dimensionId && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                                        {errors.dimensionId}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label={t('Order')}
                                                name="order"
                                                value={values.order}
                                                onChange={handleChange}
                                                error={touched.order && Boolean(errors.order)}
                                                helperText={touched.order && errors.order}
                                                inputProps={{ min: 1, max: 1000 }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label={t('Min Score')}
                                                name="scoreRange.min"
                                                value={values.scoreRange.min}
                                                onChange={handleChange}
                                                error={touched.scoreRange?.min && Boolean(errors.scoreRange?.min)}
                                                helperText={touched.scoreRange?.min && errors.scoreRange?.min}
                                                inputProps={{ min: 0, max: 100 }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label={t('Max Score')}
                                                name="scoreRange.max"
                                                value={values.scoreRange.max}
                                                onChange={handleChange}
                                                error={touched.scoreRange?.max && Boolean(errors.scoreRange?.max)}
                                                helperText={touched.scoreRange?.max && errors.scoreRange?.max}
                                                inputProps={{ min: 0, max: 100 }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
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

                                {/* Questions */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Questions')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label={t('Question (Turkish)')}
                                                name="question.tr"
                                                value={values.question.tr}
                                                onChange={handleChange}
                                                error={touched.question?.tr && Boolean(errors.question?.tr)}
                                                helperText={touched.question?.tr && errors.question?.tr}
                                                placeholder={t('Enter interview question in Turkish')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label={t('Question (English)')}
                                                name="question.en"
                                                value={values.question.en}
                                                onChange={handleChange}
                                                error={touched.question?.en && Boolean(errors.question?.en)}
                                                helperText={touched.question?.en && errors.question?.en}
                                                placeholder={t('Enter interview question in English')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <Divider />

                                {/* Purpose */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Purpose')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label={t('Purpose (Turkish)')}
                                                name="purpose.tr"
                                                value={values.purpose.tr}
                                                onChange={handleChange}
                                                error={touched.purpose?.tr && Boolean(errors.purpose?.tr)}
                                                helperText={touched.purpose?.tr && errors.purpose?.tr}
                                                placeholder={t('Enter purpose of this question in Turkish')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label={t('Purpose (English)')}
                                                name="purpose.en"
                                                value={values.purpose.en}
                                                onChange={handleChange}
                                                error={touched.purpose?.en && Boolean(errors.purpose?.en)}
                                                helperText={touched.purpose?.en && errors.purpose?.en}
                                                placeholder={t('Enter purpose of this question in English')}
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
                                {mode === 'create' ? t('Create Question') : t('Save Changes')}
                            </LoadingButton>
                        </DialogActions>
                    </>
                )}
            </Formik>
        </Dialog>
    );
};

export default InterviewQuestionCreateDialog;