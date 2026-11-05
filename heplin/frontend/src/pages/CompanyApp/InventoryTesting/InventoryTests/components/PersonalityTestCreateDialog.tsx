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
    Box,
    Checkbox,
    ListItemText
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { usePostNewPersonalityTestMutation, useUpdatePersonalityTestMutation } from 'src/hooks/useServices/usePersonalityTestServices';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface PersonalityTestFormData {
    testCode: string;
    name: {
        tr: string;
        en: string;
    };
    description: {
        tr: string;
        en: string;
    };
    instructions: {
        tr: string;
        en: string;
    };
    timeLimit: number | null;
    timeLimitEnabled: boolean;
    collectDemographics: boolean;
    demographicFields: string[];
    isActive: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    initialValues?: PersonalityTestFormData;
    testId?: string;
    onSuccess?: () => void;
}

const PersonalityTestCreateDialog = ({
    open,
    onClose,
    mode = 'create',
    initialValues: editInitialValues,
    testId,
    onSuccess
}: Props) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = usePostNewPersonalityTestMutation();
    const updateMutation = useUpdatePersonalityTestMutation();

    const defaultInitialValues: PersonalityTestFormData = {
        testCode: '',
        name: {
            tr: '',
            en: ''
        },
        description: {
            tr: '',
            en: ''
        },
        instructions: {
            tr: '',
            en: ''
        },
        timeLimit: null,
        timeLimitEnabled: false,
        collectDemographics: false,
        demographicFields: [],
        isActive: true
    };

    const initialValues = editInitialValues || defaultInitialValues;

    const validationSchema = yup.object({
        testCode: yup
            .string()
            .required(t('Test code is required'))
            .min(2, t('Test code must be at least 2 characters'))
            .max(20, t('Test code must be at most 20 characters'))
            .matches(/^[A-Z0-9_]+$/, t('Test code must contain only uppercase letters, numbers, and underscores')),
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
        instructions: yup.object({
            tr: yup
                .string()
                .required(t('Turkish instructions are required'))
                .min(20, t('Instructions must be at least 20 characters'))
                .max(1000, t('Instructions must be at most 1000 characters')),
            en: yup
                .string()
                .required(t('English instructions are required'))
                .min(20, t('Instructions must be at least 20 characters'))
                .max(1000, t('Instructions must be at most 1000 characters'))
        }),
        timeLimit: yup
            .number()
            .nullable()
            .when('timeLimitEnabled', {
                is: true,
                then: (schema) => schema
                    .required(t('Time limit is required when enabled'))
                    .min(5, t('Time limit must be at least 5 minutes'))
                    .max(480, t('Time limit cannot exceed 8 hours (480 minutes)')),
            }),
        timeLimitEnabled: yup.boolean(),
        collectDemographics: yup.boolean(),
        demographicFields: yup.array().of(yup.string()),
        isActive: yup.boolean()
    });

    const predefinedDemographicFields = [
        'age',
        'gender',
        'education',
        'experience',
        'department',
        'position',
        'location',
        'maritalStatus'
    ];

    const handleSubmit = async (values: PersonalityTestFormData, helpers: FormikHelpers<PersonalityTestFormData>) => {
        try {
            const payload = {
                ...values,
                timeLimit: values.timeLimitEnabled ? values.timeLimit : null,
                demographicFields: values.collectDemographics ? values.demographicFields : []
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                toast.success(t('Personality test created successfully'));
            } else {
                if (!testId) {
                    throw new Error('testId is required for edit mode');
                }
                await updateMutation.mutateAsync({ id: testId, payload });
                toast.success(t('Personality test updated successfully'));
            }

            queryClient.invalidateQueries(['personalityTests']);
            onClose();
            helpers.resetForm();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.message ||
                t(mode === 'create' ? 'An error occurred while creating test' : 'An error occurred while updating test');
            toast.error(errorMessage);
        } finally {
            helpers.setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { minHeight: '80vh', maxHeight: '90vh' }
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
                                {mode === 'create' ? t('Create New Personality Test') : t('Edit Personality Test')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {mode === 'create' ?
                                    t('Create a new personality inventory test') :
                                    t('Edit the selected personality test')
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
                                            <TextField
                                                fullWidth
                                                label={t('Test Code')}
                                                name="testCode"
                                                value={values.testCode}
                                                onChange={handleChange}
                                                error={touched.testCode && Boolean(errors.testCode)}
                                                helperText={touched.testCode && errors.testCode}
                                                placeholder="e.g., PERS_001, BIG5_TEST"
                                                InputProps={{
                                                    style: { fontFamily: 'monospace' }
                                                }}
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

                                {/* Multilingual Names */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Test Names')}
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
                                                placeholder={t('Enter Turkish test name')}
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
                                                placeholder={t('Enter English test name')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <Divider />

                                {/* Descriptions */}
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

                                <Divider />

                                {/* Instructions */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Test Instructions')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={6}
                                                label={t('Instructions (Turkish)')}
                                                name="instructions.tr"
                                                value={values.instructions.tr}
                                                onChange={handleChange}
                                                error={touched.instructions?.tr && Boolean(errors.instructions?.tr)}
                                                helperText={touched.instructions?.tr && errors.instructions?.tr}
                                                placeholder={t('Enter test instructions in Turkish')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={6}
                                                label={t('Instructions (English)')}
                                                name="instructions.en"
                                                value={values.instructions.en}
                                                onChange={handleChange}
                                                error={touched.instructions?.en && Boolean(errors.instructions?.en)}
                                                helperText={touched.instructions?.en && errors.instructions?.en}
                                                placeholder={t('Enter test instructions in English')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <Divider />

                                {/* Time Limit Settings */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Time Settings')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.timeLimitEnabled}
                                                        onChange={(e) => {
                                                            setFieldValue('timeLimitEnabled', e.target.checked);
                                                            if (!e.target.checked) {
                                                                setFieldValue('timeLimit', null);
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={t('Enable Time Limit')}
                                            />
                                        </Grid>

                                        {values.timeLimitEnabled && (
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label={t('Time Limit (minutes)')}
                                                    name="timeLimit"
                                                    value={values.timeLimit || ''}
                                                    onChange={handleChange}
                                                    error={touched.timeLimit && Boolean(errors.timeLimit)}
                                                    helperText={touched.timeLimit && errors.timeLimit}
                                                    inputProps={{ min: 5, max: 480 }}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </div>

                                <Divider />

                                {/* Demographics Settings */}
                                <div>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Demographics Collection')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={values.collectDemographics}
                                                        onChange={(e) => {
                                                            setFieldValue('collectDemographics', e.target.checked);
                                                            if (!e.target.checked) {
                                                                setFieldValue('demographicFields', []);
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={t('Collect Demographic Data')}
                                            />
                                        </Grid>

                                        {values.collectDemographics && (
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>{t('Demographic Fields')}</InputLabel>
                                                    <Select
                                                        multiple
                                                        value={values.demographicFields}
                                                        onChange={(e) => setFieldValue('demographicFields', e.target.value)}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selected.map((value) => (
                                                                    <Chip key={value} label={t(value)} size="small" />
                                                                ))}
                                                            </Box>
                                                        )}
                                                    >
                                                        {predefinedDemographicFields?.map((field) => (
                                                            <MenuItem key={field} value={field}>
                                                                <Checkbox checked={values?.demographicFields.indexOf(field) > -1} />
                                                                <ListItemText primary={t(field)} />
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        )}
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
                                {mode === 'create' ? t('Create Test') : t('Save Changes')}
                            </LoadingButton>
                        </DialogActions>
                    </>
                )}
            </Formik>
        </Dialog>
    );
};

export default PersonalityTestCreateDialog;