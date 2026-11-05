import React, { useMemo, useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Alert,
    Pagination
} from '@mui/material'
import {
    MoreVert,
    Edit,
    Delete,
    Visibility,
    ToggleOn,
    ToggleOff,
    ContentCopy,
    ArrowBack,
    FileUpload,
    FileDownload
} from '@mui/icons-material'
import { CustomButton } from 'src/components/shared'
import {
    useGetAllQuestionsQuery,
    useDeleteQuestionMutation,
    useToggleQuestionStatusMutation,
    useDuplicateQuestionMutation,
    useDownloadExcelTemplate,
    useBulkImportFromExcelMutation
} from 'src/hooks/useServices'
import { enqueueSnackbar } from 'notistack'
import { useSearchParams } from 'react-router-dom'
import { QuizQuestion } from 'src/services/quiz'

function QuizQuestionList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const [tag, setTag] = useState('')
    const [isActive, setIsActive] = useState<boolean | undefined>(true)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Queries and Mutations
    const questionsQuery = useGetAllQuestionsQuery({
        page,
        limit,
        search: search || undefined,
        difficulty: difficulty as any || undefined,
        tag: tag || undefined,
        isActive: isActive
    })


    const deleteQuestionMutation = useDeleteQuestionMutation()
    const toggleStatusMutation = useToggleQuestionStatusMutation()
    const duplicateMutation = useDuplicateQuestionMutation()
    const downloadTemplateMutation = useDownloadExcelTemplate()
    const bulkImportMutation = useBulkImportFromExcelMutation()

    const questions = useMemo(() =>
        questionsQuery.data?.data?.results || [],
        [questionsQuery.data]
    )

    const handleDownloadTemplate = async () => {
        try {
            await downloadTemplateMutation.mutateAsync()
            enqueueSnackbar('Excel template başarıyla indirildi!', { variant: 'success' })
        } catch (error: any) {
            enqueueSnackbar('Template indirilirken hata oluştu!', { variant: 'error' })
        }
    }

    const handleFileUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.xlsx,.xls'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                try {
                    await bulkImportMutation.mutateAsync(file)
                    enqueueSnackbar('Excel dosyası başarıyla yüklendi!', { variant: 'success' })
                    questionsQuery.refetch() // Listeyi yenile
                } catch (error: any) {
                    enqueueSnackbar(
                        error?.response?.data?.message || 'Excel dosyası yüklenirken hata oluştu!',
                        { variant: 'error' }
                    )
                }
            }
        }
        input.click()
    }

    const handleGoBack = () => {
        setSearchParams((prev) => {
            prev.set('activeTab', 'quiz')
            return prev
        })
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, question: QuizQuestion) => {
        setAnchorEl(event.currentTarget)
        setSelectedQuestion(question)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedQuestion(null)
    }

    const handleEdit = () => {
        if (selectedQuestion) {
            setSearchParams((prev) => {
                prev.set('activeTab', 'quizQuestions')
                prev.set('editId', selectedQuestion._id || '')
                return prev
            })
        }
        handleMenuClose()
    }

    const handleDelete = async () => {
        if (selectedQuestion?._id) {
            try {
                await deleteQuestionMutation.mutateAsync(selectedQuestion._id)
                enqueueSnackbar('Soru başarıyla silindi!', { variant: 'success' })
                setDeleteDialogOpen(false)
                handleMenuClose()
            } catch (error: any) {
                enqueueSnackbar(
                    error?.response?.data?.message || 'Soru silinirken hata oluştu!',
                    { variant: 'error' }
                )
            }
        }
    }

    const handleToggleStatus = async () => {
        if (selectedQuestion?._id) {
            try {
                await toggleStatusMutation.mutateAsync({
                    questionId: selectedQuestion._id,
                    isActive: !selectedQuestion.isActive // Mevcut durumun tersini gönder
                });
                enqueueSnackbar('Soru durumu güncellendi!', { variant: 'success' });
                handleMenuClose();
            } catch (error: any) {
                enqueueSnackbar('Durum güncellenirken hata oluştu!', { variant: 'error' });
            }
        }
    }

    // const handleDuplicate = async () => {
    //     if (selectedQuestion?._id) {
    //         try {
    //             await duplicateMutation.mutateAsync(selectedQuestion._id)
    //             enqueueSnackbar('Soru başarıyla kopyalandı!', { variant: 'success' })
    //             handleMenuClose()
    //         } catch (error: any) {
    //             enqueueSnackbar('Soru kopyalanırken hata oluştu!', { variant: 'error' })
    //         }
    //     }
    // }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'success'
            case 'medium': return 'warning'
            case 'hard': return 'error'
            default: return 'default'
        }
    }

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Kolay'
            case 'medium': return 'Orta'
            case 'hard': return 'Zor'
            default: return difficulty
        }
    }

    return (
        <div className="w-full px-4 py-8">
            {/* Header */}
            <div className='max-w-7xl mb-8 flex items-center justify-between'>
                <div className="flex items-center gap-4">
                    <IconButton
                        onClick={handleGoBack}
                        sx={{
                            color: '#5E5E5E',

                            '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" className="text-[24px] text-[#5E5E5E] font-medium">
                        Quiz Soruları Listesi
                    </Typography>
                </div>
                <div className="flex gap-3">
                    <CustomButton
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={handleDownloadTemplate}
                        disabled={downloadTemplateMutation.isPending}
                        sx={{
                            height: "30px",
                        }}

                    >
                        {downloadTemplateMutation.isPending ? 'İndiriliyor...' : 'Template İndir'}
                    </CustomButton>
                    <CustomButton
                        variant="contained"
                        startIcon={<FileUpload />}
                        onClick={handleFileUpload}
                        disabled={bulkImportMutation.isPending}
                        sx={{
                            backgroundColor: "#217346",
                            color: "#fff",
                            height: "30px",
                            '&:hover': {
                                backgroundColor: "#1d5f3a"
                            },
                            boxShadow: "0px 2px 8px rgba(33, 115, 70, 0.3)",
                            fontWeight: 500,
                        }}
                    >
                        {bulkImportMutation.isPending ? 'Yükleniyor...' : 'Excel İçe Aktar'}
                    </CustomButton>
                </div>
            </div>

            {/* Filters */}
            <Card sx={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640", mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Soru Ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                        height: '40px'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ fontSize: '14px' }}>Zorluk</InputLabel>
                                <Select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    label="Zorluk"
                                    sx={{
                                        fontSize: '14px',
                                        height: '40px'
                                    }}
                                >
                                    <MenuItem value="" sx={{ fontSize: '14px' }}>Tümü</MenuItem>
                                    <MenuItem value="easy" sx={{ fontSize: '14px' }}>Kolay</MenuItem>
                                    <MenuItem value="medium" sx={{ fontSize: '14px' }}>Orta</MenuItem>
                                    <MenuItem value="hard" sx={{ fontSize: '14px' }}>Zor</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ fontSize: '14px' }}>Durum</InputLabel>
                                <Select
                                    value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === 'all') setIsActive(undefined);
                                        else if (value === 'active') setIsActive(true);
                                        else setIsActive(false);
                                    }}
                                    label="Durum"
                                    sx={{
                                        fontSize: '14px',
                                        height: '40px'
                                    }}
                                >
                                    <MenuItem value="all" sx={{ fontSize: '14px' }}>Tümü</MenuItem>
                                    <MenuItem value="active" sx={{ fontSize: '14px' }}>Aktif</MenuItem>
                                    <MenuItem value="inactive" sx={{ fontSize: '14px' }}>Pasif</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                label="Tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                        height: '40px'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <CustomButton
                                fullWidth
                                onClick={() => {
                                    setSearch('')
                                    setDifficulty('')
                                    setTag('')
                                    setIsActive(true)
                                    setPage(1)
                                }}
                                variant="outlined"
                                size="small"
                                sx={{
                                    height: '40px',
                                    fontSize: '13px',
                                    minWidth: 'auto',
                                    px: 2
                                }}
                            >
                                Temizle
                            </CustomButton>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Questions List */}
            {questionsQuery.isLoading ? (
                <div className="text-center py-8">Yükleniyor...</div>
            ) : questions.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Henüz hiç soru eklenmemiş.
                </Alert>
            ) : (
                <div className="space-y-6">
                    {questions.map((question: QuizQuestion) => (
                        <Card
                            key={question._id}
                            sx={{
                                boxShadow: "0px 4px 14.8px 0px #A6A6A640",
                                borderRadius: 2,
                                '&:hover': {
                                    boxShadow: "0px 6px 20px 0px #A6A6A660"
                                }
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        {/* Title and Status */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <Typography
                                                variant="h5"
                                                className="font-semibold text-[18px] text-gray-800 flex-1"
                                            >
                                                {question.title}
                                            </Typography>
                                            <div className="flex gap-2">
                                                <Chip
                                                    label={getDifficultyText(question.difficulty)}
                                                    color={getDifficultyColor(question.difficulty) as any}
                                                    size="medium"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                                <Chip
                                                    label={question.isActive ? 'Aktif' : 'Pasif'}
                                                    color={question.isActive ? 'success' : 'default'}
                                                    size="medium"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Question Text */}
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            className="mb-4 leading-relaxed text-[16px]"
                                        >
                                            {question.question}
                                        </Typography>

                                        {/* Meta Information */}
                                        <div className="flex items-center gap-6 text-[14px] text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">Puan:</span>
                                                <span>{question.points}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">Süre:</span>
                                                <span>{question.timeLimit || 30}s</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">Şık Sayısı:</span>
                                                <span>{question.options?.length}</span>
                                            </div>
                                        </div>

                                        {/* Options Preview */}
                                        {question.options && question.options.length > 0 && (
                                            <div className="mt-4">
                                                <Typography
                                                    variant="subtitle2"
                                                    className="text-gray-700 mb-3 font-medium"
                                                >
                                                    Cevap Şıkları:
                                                </Typography>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {question.options.map((option: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className={`text-[14px] p-3 rounded-lg border-2 transition-colors ${option.isCorrect
                                                                ? 'bg-green-50 border-green-300 text-green-800'
                                                                : 'bg-gray-50 border-gray-200 text-gray-700'
                                                                }`}
                                                        >
                                                            <span className="font-semibold mr-2">
                                                                {String.fromCharCode(65 + index)})
                                                            </span>
                                                            {option.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Menu Button */}
                                    <IconButton
                                        onClick={(e) => handleMenuOpen(e, question)}
                                        sx={{
                                            color: '#666',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                                color: '#333'
                                            }
                                        }}
                                    >
                                        <MoreVert />
                                    </IconButton>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {questions.length > 0 && questionsQuery.data?.data?.count && questionsQuery.data.data.count > limit && (
                <Box display="flex" justifyContent="center" mt={6} mb={4}>
                    <Pagination
                        count={Math.ceil(questionsQuery.data.data.count / limit)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '16px',
                                height: '40px',
                                minWidth: '40px'
                            }
                        }}
                    />
                </Box>
            )}

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>
                    <Edit fontSize="small" sx={{ mr: 1 }} />
                    Düzenle
                </MenuItem>
                <MenuItem onClick={() => setDeleteDialogOpen(true)}>
                    <Delete fontSize="small" sx={{ mr: 1 }} />
                    Sil
                </MenuItem>
                <MenuItem onClick={handleToggleStatus}>
                    {selectedQuestion?.isActive ? (
                        <>
                            <ToggleOff fontSize="small" sx={{ mr: 1 }} />
                            Pasif Yap
                        </>
                    ) : (
                        <>
                            <ToggleOn fontSize="small" sx={{ mr: 1 }} />
                            Aktif Yap
                        </>
                    )}
                </MenuItem>
                {/* <MenuItem onClick={handleDuplicate}>
                    <ContentCopy fontSize="small" sx={{ mr: 1 }} />
                    Kopyala
                </MenuItem> */}
            </Menu>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Soruyu Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        "{selectedQuestion?.title}" adlı soruyu silmek istediğinizden emin misiniz?
                        Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        disabled={deleteQuestionMutation.isLoading}
                    >
                        {deleteQuestionMutation.isLoading ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default QuizQuestionList