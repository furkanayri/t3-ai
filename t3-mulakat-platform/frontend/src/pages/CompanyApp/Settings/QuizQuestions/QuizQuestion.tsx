import React from 'react'
import { Formik, Form, FieldArray } from 'formik'
import * as Yup from 'yup'
import {
    Box,
    Card,
    CardContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Chip,
    IconButton,
    Typography,
    Divider,
    Grid
} from '@mui/material'
import { Add, Delete, ArrowBack } from '@mui/icons-material'
import { CustomButton } from 'src/components/shared'
import {
    useCreateQuestionMutation,
    useGetQuestionQuery,
    useUpdateQuestionMutation
} from 'src/hooks/useServices'
import { enqueueSnackbar } from 'notistack'
import { useSearchParams } from 'react-router-dom'

interface QuizQuestionForm {
    // Temel Bilgiler
    title: string;
    description?: string;
    question: string;
    categoryId?: string;

    // Şıklar
    options: {
        text: string;
        isCorrect: boolean;
        optionId?: string;
    }[];

    // Ayarlar
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    timeLimit?: number;

    // Metadata
    tags?: string[];
    explanation?: string;
}

const validationSchema = Yup.object({
    title: Yup.string().required('Soru başlığı zorunludur'),
    question: Yup.string().required('Soru metni zorunludur'),
    points: Yup.number()
        .positive('Puan pozitif olmalıdır')
        .required('Puan zorunludur'),
    options: Yup.array()
        .of(
            Yup.object({
                text: Yup.string().required('Şık metni zorunludur'),
                isCorrect: Yup.boolean()
            })
        )
        .min(2, 'En az 2 şık olmalıdır')
        .test('at-least-one-correct', 'En az bir doğru cevap seçilmelidir', function (options) {
            return options?.some(option => option.isCorrect) || false;
        }),
    difficulty: Yup.string().oneOf(['easy', 'medium', 'hard']).required(),
    description: Yup.string(),
    categoryId: Yup.string(),
    timeLimit: Yup.number().positive('Zaman limiti pozitif olmalıdır'),
    explanation: Yup.string()
});

const initialValues: QuizQuestionForm = {
    title: '',
    description: '',
    question: '',
    categoryId: '',
    options: [
        { text: '', isCorrect: false, optionId: 'a' },
        { text: '', isCorrect: false, optionId: 'b' }
    ],
    difficulty: 'medium',
    points: 10,
    timeLimit: 30,
    tags: [],
    explanation: ''
};

function QuizQuestion() {
    const createQuestionMutation = useCreateQuestionMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Edit mode kontrolü
    const editId = searchParams.get('editId');
    const isEditMode = !!editId;

    // Edit için veri çekme
    const questionQuery = isEditMode ? useGetQuestionQuery(editId || '') : { data: null, isLoading: false };

    const handleGoBack = () => {
        setSearchParams((prev) => {
            prev.set('activeTab', 'quiz');
            prev.delete('editId'); // Edit ID'yi temizle
            return prev;
        });
    };

    const handleSubmit = async (values: QuizQuestionForm, { setSubmitting, resetForm }: any) => {
        try {
            // optionId'leri otomatik oluştur
            const processedValues = {
                ...values,
                options: values.options.map((option, index) => ({
                    ...option,
                    optionId: String.fromCharCode(97 + index) // a, b, c, d...
                }))
            };

            if (isEditMode && editId) {
                // Update işlemi
                await updateQuestionMutation.mutateAsync({
                    questionId: editId,
                    questionData: processedValues
                });
                enqueueSnackbar('Quiz sorusu başarıyla güncellendi!', { variant: 'success' });
            } else {
                // Create işlemi
                await createQuestionMutation.mutateAsync(processedValues);
                enqueueSnackbar('Quiz sorusu başarıyla oluşturuldu!', { variant: 'success' });
                resetForm();
            }

            // Search param ile geri dön
            handleGoBack();
        } catch (error: any) {
            const operation = isEditMode ? 'güncellenirken' : 'oluşturulurken';
            enqueueSnackbar(
                error?.response?.data?.message || `Quiz sorusu ${operation} bir hata oluştu!`,
                { variant: 'error' }
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Initial values'u edit mode'a göre belirle
    const getInitialValues = (): QuizQuestionForm => {
        if (isEditMode && questionQuery.data?.data) {
            const question = questionQuery.data.data;
            return {
                title: question.title || '',
                description: question.description || '',
                question: question.question || '',
                categoryId: question.categoryId || '',
                options: question.options?.length > 0 ? question.options.map((opt: any) => ({
                    text: opt.text || '',
                    isCorrect: opt.isCorrect || false,
                    optionId: opt.optionId || ''
                })) : [
                    { text: '', isCorrect: false, optionId: 'a' },
                    { text: '', isCorrect: false, optionId: 'b' }
                ],
                difficulty: question.difficulty || 'medium',
                points: question.points || 10,
                timeLimit: question.timeLimit || 30,
                tags: question.tags || [],
                explanation: question.explanation || ''
            };
        }
        return initialValues;
    };

    // Loading state
    if (isEditMode && questionQuery.isLoading) {
        return (
            <div className="max-w-7xl pt-12">
                <div className="text-center py-8">
                    <Typography>Soru yükleniyor...</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl pt-12 ">
            <div className='mb-4 flex items-center gap-3'>
                <IconButton
                    onClick={handleGoBack}
                    sx={{
                        color: '#5E5E5E',
                        '&:hover': {
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" className="text-[20px] text-[#5E5E5E] font-medium ">
                    {isEditMode ? 'Quiz Sorusunu Düzenle' : 'Quiz Sorusu Oluştur'}
                </Typography>
            </div>

            <Card sx={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640", mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Formik
                        initialValues={getInitialValues()}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true} // Edit mode'da verileri yeniden yükle
                    >
                        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                            <Form>
                                <Grid container spacing={3}>
                                    {/* Temel Bilgiler */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" className="mb-4">Temel Bilgiler</Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name="title"
                                            label="Soru Başlığı *"
                                            value={values.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.title && Boolean(errors.title)}
                                            helperText={touched.title && errors.title}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            name="question"
                                            label="Soru Metni *"
                                            value={values.question}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.question && Boolean(errors.question)}
                                            helperText={touched.question && errors.question}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            name="description"
                                            label="Açıklama"
                                            value={values.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </Grid>

                                    <Divider sx={{ width: '100%', my: 3 }} />

                                    {/* Şıklar */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" className="mb-4">Cevap Şıkları</Typography>
                                        <FieldArray name="options">
                                            {({ push, remove }) => (
                                                <Box>
                                                    {values.options.map((option, index) => (
                                                        <Box key={index} className="flex items-center gap-3 mb-3">
                                                            <Typography className="min-w-[20px]">
                                                                {String.fromCharCode(97 + index).toUpperCase()})
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                name={`options.${index}.text`}
                                                                label={`Şık ${String.fromCharCode(97 + index).toUpperCase()}`}
                                                                value={option.text}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}


                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        name={`options.${index}.isCorrect`}
                                                                        checked={option.isCorrect}
                                                                        onChange={(e) => setFieldValue(`options.${index}.isCorrect`, e.target.checked)}
                                                                    />
                                                                }
                                                                label="Doğru"
                                                            />
                                                            {values.options.length > 2 && (
                                                                <IconButton
                                                                    onClick={() => remove(index)}
                                                                    color="error"
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    ))}
                                                    <CustomButton
                                                        onClick={() => push({
                                                            text: '',
                                                            isCorrect: false,
                                                            optionId: String.fromCharCode(97 + values.options.length)
                                                        })}
                                                        startIcon={<Add />}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        Şık Ekle
                                                    </CustomButton>
                                                    {errors.options && typeof errors.options === 'string' && (
                                                        <Typography color="error" variant="caption" display="block" mt={1}>
                                                            {errors.options}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </FieldArray>
                                    </Grid>

                                    <Divider sx={{ width: '100%', my: 3 }} />

                                    {/* Ayarlar */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" className="mb-4">Soru Ayarları</Typography>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Zorluk Seviyesi</InputLabel>
                                            <Select
                                                name="difficulty"
                                                value={values.difficulty}
                                                onChange={handleChange}
                                                label="Zorluk Seviyesi"
                                            >
                                                <MenuItem value="easy">Kolay</MenuItem>
                                                <MenuItem value="medium">Orta</MenuItem>
                                                <MenuItem value="hard">Zor</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            name="points"
                                            label="Puan *"
                                            value={values.points}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.points && Boolean(errors.points)}
                                            helperText={touched.points && errors.points}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            name="timeLimit"
                                            label="Zaman Limiti (saniye)"
                                            value={values.timeLimit}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.timeLimit && Boolean(errors.timeLimit)}
                                            helperText={touched.timeLimit && errors.timeLimit}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            name="explanation"
                                            label="Doğru Cevap Açıklaması"
                                            value={values.explanation}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </Grid>

                                    {/* Submit Button */}
                                    <Grid item xs={12}>
                                        <Box className="flex justify-end gap-3 mt-6">
                                            <CustomButton
                                                variant="outlined"
                                                onClick={handleGoBack}
                                            >
                                                İptal
                                            </CustomButton>
                                            <CustomButton
                                                type="submit"
                                                disabled={isSubmitting || createQuestionMutation.isPending || updateQuestionMutation.isPending}
                                                sx={{
                                                    backgroundColor: "#E31E24",
                                                    color: "#fff",
                                                    '&:hover': {
                                                        backgroundColor: "#d01419"
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: "#ccc"
                                                    }
                                                }}
                                            >
                                                {isSubmitting || createQuestionMutation.isPending || updateQuestionMutation.isPending
                                                    ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...')
                                                    : (isEditMode ? 'Soruyu Güncelle' : 'Soruyu Kaydet')
                                                }
                                            </CustomButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    )
}

export default QuizQuestion