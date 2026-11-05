import React, { useMemo, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Alert,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    InputAdornment,
    Divider,
    Chip
} from '@mui/material'
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useCreateQuizSetMutation, useUpdateQuizSetMutation } from 'src/hooks/useServices/useQuizSet'
import { useGetAllQuestionsQuery } from 'src/hooks/useServices/useQuizServices'
import { enqueueSnackbar } from 'notistack'
import { useQueryClient } from '@tanstack/react-query'

interface QuizSetDialogProps {
    open: boolean;
    onClose: () => void;
    quizSet?: any; // Edit mode için mevcut quiz set
}

interface Question {
    _id: string;
    title: string;
    description?: string;
    question: string;
    difficulty?: string;
    tags?: string[];
    points?: number;
    timeLimit?: number;
    isActive?: boolean;
}

interface QuizSetFormValues {
    title: string;
    description: string;
    questionIds: string[];
    passingScore: number;
    timeLimit: number | null;
    maxAttempts: number;
    isRandomOrder: boolean;
}

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Quiz set başlığı zorunludur')
        .min(3, 'Başlık en az 3 karakter olmalıdır')
        .max(100, 'Başlık en fazla 100 karakter olmalıdır'),
    description: Yup.string()
        .max(500, 'Açıklama en fazla 500 karakter olmalıdır'),
    questionIds: Yup.array()
        .of(Yup.string().required())
        .min(1, 'En az bir soru seçilmelidir')
        .required('Sorular zorunludur')
        .test('no-null-values', 'Geçersiz soru ID\'leri', function (value) {
            if (!value) return false;
            return value.every(id => id != null && id !== '');
        }),
    passingScore: Yup.number()
        .min(0, 'Geçme puanı 0\'dan küçük olamaz')
        .max(100, 'Geçme puanı 100\'den büyük olamaz')
        .required('Geçme puanı zorunludur'),
    timeLimit: Yup.number()
        .nullable()
        .min(1, 'Süre sınırı pozitif bir değer olmalıdır'),
    maxAttempts: Yup.number()
        .min(1, 'Max deneme sayısı en az 1 olmalıdır')
        .required('Max deneme sayısı zorunludur'),
    isRandomOrder: Yup.boolean(),
});

const initialValues: QuizSetFormValues = {
    title: '',
    description: '',
    questionIds: [],
    passingScore: 60,
    timeLimit: null,
    maxAttempts: 3,
    isRandomOrder: false,
};

function QuizSetDialog({ open, onClose, quizSet }: QuizSetDialogProps) {
    const queryClient = useQueryClient();
    const createMutation = useCreateQuizSetMutation();
    const updateMutation = useUpdateQuizSetMutation();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(5);

    const isEditMode = !!quizSet;

    const questionsQuery = useGetAllQuestionsQuery({
        page,
        limit,
        search: search || undefined,
        difficulty: undefined,
        tag: undefined,
        isActive: true
    });

    const questions: Question[] = questionsQuery.data?.data?.results || [];
    const totalPages = Math.ceil((questionsQuery.data?.total || 0) / limit);

    // Debug için

    const handleSubmit = async (values: QuizSetFormValues, { resetForm }: any) => {
        try {
            console.log('handleSubmit çağrıldı', { isEditMode, quizSet, values });

            // Filter out null/undefined values from questionIds
            const validQuestionIds = values.questionIds.filter(id => id != null && id !== '');

            // Prepare payload - remove null values and empty strings
            const payload: any = {
                title: values.title.trim(),
                questionIds: validQuestionIds,
                passingScore: values.passingScore,
                maxAttempts: values.maxAttempts,
                isRandomOrder: values.isRandomOrder
                // showResults: values.showResults // TODO: İleride eklenecek
            };

            if (values.description && values.description.trim()) {
                payload.description = values.description.trim();
            }

            if (values.timeLimit && values.timeLimit > 0) {
                payload.timeLimit = values.timeLimit;
            }

            console.log('Payload hazırlandı:', payload);

            if (isEditMode) {
                console.log('Update mode - quizSetId:', quizSet?._id);
                // Update existing quiz set
                await updateMutation.mutateAsync({
                    quizSetId: quizSet._id,
                    payload
                }, {
                    onSuccess: () => {
                        enqueueSnackbar('Soru Grubu başarıyla güncellendi!', { variant: 'success' })
                        queryClient.invalidateQueries({ queryKey: ['quiz-sets'] })
                    }
                });
            } else {
                console.log('Create mode');
                // Create new quiz set
                await createMutation.mutateAsync(payload, {
                    onSuccess: () => {
                        enqueueSnackbar('Soru Grubu başarıyla oluşturuldu!', { variant: 'success' })
                        queryClient.invalidateQueries({ queryKey: ['quiz-sets'] })
                    }
                });
            }
            resetForm(); // Form'u sıfırla
            onClose();
        } catch (error) {
            console.error('Quiz set işlem hatası:', error);
            enqueueSnackbar('İşlem başarısız oldu!', { variant: 'error' })
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <Formik
                initialValues={isEditMode ? {
                    title: quizSet.title || '',
                    description: quizSet.description || '',
                    questionIds: quizSet.questionIds || [],
                    passingScore: quizSet.passingScore || 60,
                    timeLimit: quizSet.timeLimit || null,
                    maxAttempts: quizSet.maxAttempts || 3,
                    isRandomOrder: quizSet.isRandomOrder || false,
                } : initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, resetForm }) => {
                    console.log('Form render - errors:', errors);
                    console.log('Form render - values:', values);
                    console.log('Form render - touched:', touched);

                    return (
                        <Form>
                            <DialogTitle>
                                {isEditMode ? 'Soru Grubu Düzenle' : 'Soru Grubu Oluştur'}
                            </DialogTitle>

                            <DialogContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                                    {/* Title - Required */}
                                    <Field
                                        as={TextField}
                                        name="title"
                                        label="Quiz Set Başlığı"
                                        value={values.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.title && !!errors.title}
                                        helperText={touched.title && errors.title}
                                        required
                                        fullWidth
                                    />

                                    {/* Description - Optional */}
                                    <Field
                                        as={TextField}
                                        name="description"
                                        label="Açıklama"
                                        value={values.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.description && !!errors.description}
                                        helperText={touched.description && errors.description}
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />

                                    {/* Question IDs - Required */}
                                    <Box>
                                        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                                            Sorular * ({values.questionIds.length} seçili)
                                        </Typography>

                                        {/* Selected Questions Display */}
                                        {values.questionIds.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                    Seçili Sorular:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {values.questionIds.map((questionId: string) => {
                                                        const question = questions.find(q => q._id === questionId);
                                                        return (
                                                            <Chip
                                                                key={questionId}
                                                                label={question?.title || questionId}
                                                                variant="outlined"
                                                                size="small"
                                                                onDelete={() => {
                                                                    setFieldValue('questionIds',
                                                                        values.questionIds.filter((id: string) => id !== questionId)
                                                                    );
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        )}

                                        {touched.questionIds && errors.questionIds && (
                                            <Typography variant="caption" color="error">
                                                {typeof errors.questionIds === 'string' ? errors.questionIds : 'Geçersiz soru seçimi'}
                                            </Typography>
                                        )}

                                        <Divider sx={{ my: 2 }} />

                                        {/* Search */}
                                        <TextField
                                            fullWidth
                                            placeholder="Soru ara..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />

                                        {/* Questions Table */}
                                        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                indeterminate={values.questionIds.length > 0 && values.questionIds.length < questions.length}
                                                                checked={questions.length > 0 && values.questionIds.length === questions.length}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFieldValue('questionIds', questions.map(q => q._id));
                                                                    } else {
                                                                        setFieldValue('questionIds', []);
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>Soru Başlığı</TableCell>
                                                        <TableCell>Zorluk</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {questionsQuery.isLoading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} align="center">
                                                                Sorular yükleniyor...
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : questions.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} align="center">
                                                                Soru bulunamadı
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        questions.map((question) => (
                                                            <TableRow
                                                                key={question._id}
                                                                hover
                                                                selected={values.questionIds.includes(question._id)}
                                                            >
                                                                <TableCell padding="checkbox">
                                                                    <Checkbox
                                                                        checked={values.questionIds.includes(question._id)}
                                                                        onChange={(e) => {
                                                                            console.log('Checkbox clicked:', {
                                                                                questionId: question._id,
                                                                                checked: e.target.checked,
                                                                                currentQuestionIds: values.questionIds
                                                                            });

                                                                            if (e.target.checked) {
                                                                                setFieldValue('questionIds',
                                                                                    [...values.questionIds, question._id]
                                                                                );
                                                                            } else {
                                                                                setFieldValue('questionIds',
                                                                                    values.questionIds.filter((id: string) => id !== question._id)
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{question.title}</TableCell>
                                                                <TableCell>
                                                                    {question.difficulty || '-'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Pagination
                                                    count={totalPages}
                                                    page={page}
                                                    onChange={(_, newPage) => setPage(newPage)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Passing Score */}
                                    <Field
                                        as={TextField}
                                        name="passingScore"
                                        label="Geçme Puanı (0-100)"
                                        type="number"
                                        value={values.passingScore}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.passingScore && !!errors.passingScore}
                                        helperText={touched.passingScore && errors.passingScore}
                                        inputProps={{ min: 0, max: 100 }}
                                        fullWidth
                                    />

                                    {/* Time Limit */}
                                    <Field
                                        as={TextField}
                                        name="timeLimit"
                                        label="Süre Sınırı (saniye)"
                                        type="number"
                                        value={values.timeLimit || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.timeLimit && !!errors.timeLimit}
                                        helperText={touched.timeLimit && errors.timeLimit || 'Opsiyonel - Boş bırakılırsa süre sınırı olmaz'}
                                        inputProps={{ min: 1 }}
                                        fullWidth
                                    />

                                    {/* Max Attempts */}
                                    <Field
                                        as={TextField}
                                        name="maxAttempts"
                                        label="Maksimum Deneme Sayısı"
                                        type="number"
                                        value={values.maxAttempts}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.maxAttempts && !!errors.maxAttempts}
                                        helperText={touched.maxAttempts && errors.maxAttempts}
                                        inputProps={{ min: 1 }}
                                        fullWidth
                                    />

                                    {/* Random Order Switch */}
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={values.isRandomOrder}
                                                onChange={(e) => setFieldValue('isRandomOrder', e.target.checked)}
                                            />
                                        }
                                        label="Soruları rastgele sırala"
                                    />

                                    {/* Show Results Switch - TODO: İleride eklenecek */}
                                    {/* <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.showResults}
                                            onChange={(e) => setFieldValue('showResults', e.target.checked)}
                                        />
                                    }
                                    label="Sonuçları göster"
                                /> */}
                                </Box>
                            </DialogContent>

                            <DialogActions>
                                <Button
                                    onClick={() => {
                                        resetForm();
                                        onClose();
                                    }}
                                    color="inherit"
                                >
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                                >
                                    {isSubmitting || createMutation.isPending || updateMutation.isPending
                                        ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...')
                                        : (isEditMode ? 'Güncelle' : 'Kaydet')}
                                </Button>
                            </DialogActions>
                        </Form>
                    );
                }}
            </Formik>
        </Dialog>
    )
}

export default QuizSetDialog