import React, { useMemo, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Divider,
    Checkbox,
    FormControlLabel,
    Switch,
    Chip
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useGetAllUsersQuery } from 'src/hooks/useServices/admin';
import { useGetAllQuizSetsQuery } from 'src/hooks/useServices/useQuizSet';
import { useCreateQuizAssignmentMutation } from 'src/hooks/useServices/useUserQuizAssignments';
import { enqueueSnackbar } from 'notistack';
import { array } from 'src/utils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

interface QuizAssignmentDialogProps {
    open: boolean;
    onClose: () => void;
}

interface QuizAssignmentFormValues {
    userIds: string[];
    quizSetId: string; // Backend'de quizSetId bekleniyor
    dueDate: Date | null;
    note: string;
    isBulkAssignment: boolean;
}

const validationSchema = Yup.object({
    userIds: Yup.array().of(Yup.string()).min(1, 'En az bir kullanıcı seçmelisiniz'),
    quizSetId: Yup.string().required('Quiz seçimi zorunludur'),
    dueDate: Yup.date().nullable().min(new Date(), 'Bitiş tarihi bugünden önce olamaz'),
    note: Yup.string().max(500, 'Not en fazla 500 karakter olabilir'),
});

const initialValues: QuizAssignmentFormValues = {
    userIds: [],
    quizSetId: '',
    dueDate: null,
    note: '',
    isBulkAssignment: false,
};

function QuizAssignmentDialog({ open, onClose }: QuizAssignmentDialogProps) {
    // Kullanıcıları getir
    const usersQuery = useGetAllUsersQuery('limit=500&page=1&status=active');
    const users = useMemo(() => array(usersQuery?.data?.results), [usersQuery.data]);

    // Quiz setleri getir - query string'i düzelt
    const quizSetsQueryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set('limit', '500');
        params.set('page', '1');
        params.set('isActive', 'true');
        return params.toString();
    }, []);
    
    const quizSetsQuery = useGetAllQuizSetsQuery(quizSetsQueryString);
    const quizSets = useMemo(() => {
        const results = quizSetsQuery?.data?.data?.results || quizSetsQuery?.data?.results || [];
        console.log('Quiz Sets Query Response:', quizSetsQuery?.data);
        console.log('Parsed Quiz Sets:', results);
        return array(results);
    }, [quizSetsQuery.data]);

    const createAssignmentMutation = useCreateQuizAssignmentMutation();

    const handleSubmit = async (values: QuizAssignmentFormValues, { resetForm }: any) => {
        try {
            // Toplu atama
            if (values.userIds.length > 1) {
                const promises = values.userIds.map(userId => {
                    const payload = {
                        userId,
                        quizSetId: values.quizSetId, // Backend quizSetId bekliyor
                        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                        note: values.note || undefined,
                    };
                    return createAssignmentMutation.mutateAsync(payload);
                });

                await Promise.all(promises);
                enqueueSnackbar(`${values.userIds.length} kullanıcıya quiz başarıyla atandı!`, { variant: 'success' });
            } else {
                // Tek atama
                const payload = {
                    userId: values.userIds[0],
                    quizSetId: values.quizSetId, // Backend quizSetId bekliyor
                    dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                    note: values.note || undefined,
                };

                await createAssignmentMutation.mutateAsync(payload);
                enqueueSnackbar('Quiz başarıyla atandı!', { variant: 'success' });
            }

            resetForm();
            onClose();
        } catch (error: any) {
            console.error('Quiz atama hatası:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Quiz atanırken bir hata oluştu!', { variant: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6">Quiz Ata</Typography>
                <Typography variant="body2" color="text.secondary">
                    Kullanıcıya bir quiz atayın
                </Typography>
            </DialogTitle>
            <Divider />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                    <Form>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Toplu Atama Switch */}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.isBulkAssignment}
                                            onChange={(e) => {
                                                setFieldValue('isBulkAssignment', e.target.checked);
                                                setFieldValue('userIds', []);
                                            }}
                                        />
                                    }
                                    label="Toplu Atama"
                                />

                                {/* Kullanıcı Seçimi */}
                                <FormControl fullWidth error={touched.userIds && Boolean(errors.userIds)}>
                                    <Autocomplete
                                        multiple={values.isBulkAssignment}
                                        options={users}
                                        loading={usersQuery.isLoading}
                                        value={
                                            values.isBulkAssignment 
                                                ? users.filter((u: any) => values.userIds.includes(u._id))
                                                : users.find((u: any) => u._id === values.userIds[0]) || null
                                        }
                                        getOptionLabel={(option: any) => 
                                            `${option.name || ''} ${option.surname || ''} (${option.email || ''})`
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={values.isBulkAssignment ? "Kullanıcılar Seç *" : "Kullanıcı Seç *"}
                                                error={touched.userIds && Boolean(errors.userIds)}
                                                helperText={touched.userIds && errors.userIds}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {usersQuery.isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        onChange={(_, value: any) => {
                                            if (values.isBulkAssignment) {
                                                // Çoklu seçim
                                                setFieldValue('userIds', value.map((v: any) => v._id));
                                            } else {
                                                // Tekli seçim
                                                setFieldValue('userIds', value ? [value._id] : []);
                                            }
                                        }}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option: any, index) => (
                                                <Chip
                                                    label={`${option.name} ${option.surname}`}
                                                    {...getTagProps({ index })}
                                                    size="small"
                                                />
                                            ))
                                        }
                                        noOptionsText="Kullanıcı bulunamadı"
                                        disableCloseOnSelect={values.isBulkAssignment}
                                        limitTags={3}
                                    />
                                </FormControl>

                                {/* Seçili Kullanıcı Sayısı ve Tümünü Seç Butonu */}
                                {values.isBulkAssignment && (
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        {values.userIds.length > 0 && (
                                            <Alert severity="info" sx={{ flex: 1 }}>
                                                <Typography variant="body2">
                                                    {values.userIds.length} kullanıcı seçildi
                                                </Typography>
                                            </Alert>
                                        )}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                                if (values.userIds.length === users.length) {
                                                    setFieldValue('userIds', []);
                                                } else {
                                                    setFieldValue('userIds', users.map((u: any) => u._id));
                                                }
                                            }}
                                        >
                                            {values.userIds.length === users.length ? 'Tümünü Temizle' : 'Tümünü Seç'}
                                        </Button>
                                    </Box>
                                )}

                                {/* Quiz Set Seçimi */}
                                <FormControl fullWidth error={touched.quizSetId && Boolean(errors.quizSetId)}>
                                    <Autocomplete
                                        options={quizSets}
                                        loading={quizSetsQuery.isLoading}
                                        value={quizSets.find((q: any) => q._id === values.quizSetId) || null}
                                        getOptionLabel={(option: any) => 
                                            `${option.title || ''} (${option.totalQuestions || 0} soru)`
                                        }
                                        renderOption={(props, option: any) => (
                                            <li {...props}>
                                                <Box>
                                                    <Typography variant="body1">{option.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.totalQuestions || 0} Soru • {option.totalPoints || 0} Puan
                                                        {option.timeLimit && ` • ${option.timeLimit} dk`}
                                                        {option.passingScore && ` • Geçme: %${option.passingScore}`}
                                                    </Typography>
                                                </Box>
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Quiz Seç *"
                                                error={touched.quizSetId && Boolean(errors.quizSetId)}
                                                helperText={
                                                    touched.quizSetId && errors.quizSetId 
                                                        ? errors.quizSetId 
                                                        : quizSets.length === 0 && !quizSetsQuery.isLoading
                                                            ? 'Aktif quiz bulunamadı. Önce quiz oluşturun.'
                                                            : ''
                                                }
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {quizSetsQuery.isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        onChange={(_, value: any) => {
                                            setFieldValue('quizSetId', value?._id || '');
                                        }}
                                        noOptionsText={quizSetsQuery.isLoading ? "Yükleniyor..." : "Quiz bulunamadı"}
                                    />
                                </FormControl>

                                {/* Bitiş Tarihi */}
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                    <DatePicker
                                        label="Bitiş Tarihi"
                                        value={values.dueDate}
                                        onChange={(newValue) => setFieldValue('dueDate', newValue)}
                                        minDate={new Date()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: touched.dueDate && Boolean(errors.dueDate),
                                                helperText: touched.dueDate && errors.dueDate as string,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>

                                {/* Not */}
                                <TextField
                                    fullWidth
                                    label="Not (Opsiyonel)"
                                    name="note"
                                    multiline
                                    rows={3}
                                    value={values.note}
                                    onChange={(e) => setFieldValue('note', e.target.value)}
                                    error={touched.note && Boolean(errors.note)}
                                    helperText={touched.note && errors.note}
                                    placeholder="Quiz hakkında kullanıcıya not ekleyebilirsiniz..."
                                />

                                {/* Seçili Quiz Bilgisi */}
                                {values.quizSetId && (
                                    <Alert severity="info">
                                        <Typography variant="body2">
                                            <strong>Seçili Quiz:</strong>{' '}
                                            {(quizSets.find((q: any) => q._id === values.quizSetId) as any)?.title}
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {(quizSets.find((q: any) => q._id === values.quizSetId) as any)?.description || 'Açıklama yok'}
                                        </Typography>
                                    </Alert>
                                )}
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={onClose} disabled={isSubmitting}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting || quizSets.length === 0}
                                startIcon={isSubmitting && <CircularProgress size={20} />}
                            >
                                {isSubmitting 
                                    ? 'Atanıyor...' 
                                    : values.userIds.length > 1 
                                        ? `${values.userIds.length} Kullanıcıya Ata`
                                        : 'Quiz Ata'
                                }
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}

export default QuizAssignmentDialog;
