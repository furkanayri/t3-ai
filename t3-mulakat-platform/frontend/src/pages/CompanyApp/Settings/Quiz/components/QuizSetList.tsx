import React, { useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material'
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useGetAllQuizSetsQuery, useDeleteQuizSetMutation } from 'src/hooks/useServices/useQuizSet'
import { enqueueSnackbar } from 'notistack';
import QuizSetDialog from './QuizSetDialog';

function QuizSetList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
    const [sortBy] = useState('createdAt');
    const [sortOrder] = useState('desc');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedQuizSet, setSelectedQuizSet] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const deleteMutation = useDeleteQuizSetMutation();

    // Query string oluştur
    const queryString = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(isActive !== undefined && { isActive: isActive.toString() }),
        sortBy,
        sortOrder
    }).toString();

    const { data, isLoading, error, refetch } = useGetAllQuizSetsQuery(queryString);

    const quizSets = data?.data?.results || [];
    const totalPages = Math.ceil((data?.total || 0) / limit);

    const handleDeleteClick = (quizSet: any) => {
        setSelectedQuizSet(quizSet);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedQuizSet) return;
        try {
            await deleteMutation.mutateAsync({ quizSetId: selectedQuizSet._id }, {
                onSuccess: () => {
                    enqueueSnackbar('Soru Grubu başarıyla silindi!', { variant: 'success' })
                }
            });
            setDeleteDialogOpen(false);
            setSelectedQuizSet(null);
            refetch();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleEditClick = (quizSet: any) => {
        setSelectedQuizSet(quizSet);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedQuizSet(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Quiz Setleri
            </Typography>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <TextField
                            placeholder="Quiz set ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 300 }}
                            size="small"
                        />

                        {/* Active Filter */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Durum</InputLabel>
                            <Select
                                value={isActive === undefined ? 'all' : isActive.toString()}
                                label="Durum"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setIsActive(value === 'all' ? undefined : value === 'true');
                                }}
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="true">Aktif</MenuItem>
                                <MenuItem value="false">Pasif</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Başlık</TableCell>
                                <TableCell>Açıklama</TableCell>
                                <TableCell align="center">Soru Sayısı</TableCell>
                                <TableCell align="center">Geçme Puanı</TableCell>
                                <TableCell align="center">Max Deneme</TableCell>
                                <TableCell align="center">Durum</TableCell>
                                <TableCell align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ color: 'error.main' }}>
                                        Veri yüklenirken hata oluştu
                                    </TableCell>
                                </TableRow>
                            ) : quizSets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Soru grubu bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quizSets.map((quizSet: any) => (
                                    <TableRow key={quizSet._id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="medium">
                                                {quizSet.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {quizSet.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={quizSet.questionIds?.length || 0}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {quizSet.passingScore || '-'}%
                                        </TableCell>
                                        <TableCell align="center">
                                            {quizSet.maxAttempts || '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={quizSet.isActive ? 'Aktif' : 'Pasif'}
                                                color={quizSet.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditClick(quizSet)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(quizSet)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, newPage) => setPage(newPage)}
                            color="primary"
                        />
                    </Box>
                )}
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Quiz Set Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>"{selectedQuizSet?.title}"</strong> adlı quiz set'i silmek istediğinizden emin misiniz?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Quiz Set Dialog */}
            <QuizSetDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                quizSet={selectedQuizSet}
            />
        </Box>
    )
}

export default QuizSetList