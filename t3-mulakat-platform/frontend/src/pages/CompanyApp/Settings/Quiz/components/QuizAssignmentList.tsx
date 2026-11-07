import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useGetAllQuizAssignmentsQuery, useDeleteQuizAssignmentMutation } from 'src/hooks/useServices/useUserQuizAssignments';
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

function QuizAssignmentList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

    const deleteMutation = useDeleteQuizAssignmentMutation();

    // Query parametreleri oluştur
    const queryParams = useMemo(() => ({
        page,
        limit,
        status: statusFilter || undefined,
    }), [page, limit, statusFilter]);

    const { data, isLoading, error, refetch } = useGetAllQuizAssignmentsQuery(queryParams);

    const assignments = useMemo(() => data?.data?.results || [], [data]);
    const totalCount = data?.data?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Filtreleme (client-side search)
    const filteredAssignments = useMemo(() => {
        if (!search) return assignments;
        
        return assignments.filter((assignment: any) => {
            const userName = `${assignment.userId?.name || ''} ${assignment.userId?.surname || ''}`.toLowerCase();
            const userEmail = assignment.userId?.email?.toLowerCase() || '';
            const quizTitle = assignment.quizSetId?.title?.toLowerCase() || '';
            
            return userName.includes(search.toLowerCase()) ||
                   userEmail.includes(search.toLowerCase()) ||
                   quizTitle.includes(search.toLowerCase());
        });
    }, [assignments, search]);

    const handleDeleteClick = (assignment: any) => {
        setSelectedAssignment(assignment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAssignment) return;
        
        try {
            await deleteMutation.mutateAsync(selectedAssignment._id);
            enqueueSnackbar('Atama başarıyla silindi!', { variant: 'success' });
            setDeleteDialogOpen(false);
            setSelectedAssignment(null);
            refetch();
        } catch (error: any) {
            console.error('Delete error:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Silme işlemi başarısız!', { variant: 'error' });
        }
    };

    const getStatusChip = (status: string) => {
        const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
            assigned: { label: 'Atandı', color: 'default' },
            started: { label: 'Başladı', color: 'primary' },
            completed: { label: 'Tamamlandı', color: 'success' },
            overdue: { label: 'Süresi Geçti', color: 'error' },
            cancelled: { label: 'İptal', color: 'warning' },
        };

        const config = statusConfig[status] || { label: status, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        try {
            return format(new Date(date), 'dd MMM yyyy', { locale: tr });
        } catch {
            return '-';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Quiz Atamaları
            </Typography>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <TextField
                            placeholder="Kullanıcı veya quiz ara..."
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

                        {/* Status Filter */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Durum</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Durum"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                <MenuItem value="assigned">Atandı</MenuItem>
                                <MenuItem value="started">Başladı</MenuItem>
                                <MenuItem value="completed">Tamamlandı</MenuItem>
                                <MenuItem value="overdue">Süresi Geçti</MenuItem>
                                <MenuItem value="cancelled">İptal</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Kullanıcı</TableCell>
                                <TableCell>Quiz</TableCell>
                                <TableCell align="center">Durum</TableCell>
                                <TableCell align="center">Deneme</TableCell>
                                <TableCell align="center">En İyi Skor</TableCell>
                                <TableCell align="center">Atanma Tarihi</TableCell>
                                <TableCell align="center">Bitiş Tarihi</TableCell>
                                <TableCell align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ color: 'error.main' }}>
                                        Veri yüklenirken hata oluştu
                                    </TableCell>
                                </TableRow>
                            ) : filteredAssignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Atama bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAssignments.map((assignment: any) => (
                                    <TableRow key={assignment._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="medium">
                                                    {assignment.userId?.name} {assignment.userId?.surname}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {assignment.userId?.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {assignment.quizSetId?.title || '-'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {assignment.quizSetId?.totalQuestions || 0} Soru
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            {getStatusChip(assignment.status)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={`${assignment.attempts || 0}/${assignment.quizSetId?.maxAttempts || '-'}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {assignment.bestScore !== null && assignment.bestScore !== undefined ? (
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {assignment.bestScore}/{assignment.quizSetId?.totalPoints || 0}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        (%{assignment.bestScorePercentage?.toFixed(0) || 0})
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {formatDate(assignment.assignedAt)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {formatDate(assignment.dueDate)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Detay">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            // TODO: Detay sayfası açılacak
                                                            enqueueSnackbar('Detay sayfası yakında eklenecek', { variant: 'info' });
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(assignment)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                disabled={page === 1}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            >
                                Önceki
                            </Button>
                            <Typography sx={{ px: 2, py: 1 }}>
                                {page} / {totalPages}
                            </Typography>
                            <Button
                                size="small"
                                disabled={page === totalPages}
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            >
                                Sonraki
                            </Button>
                        </Box>
                    </Box>
                )}
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Atamayı Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu quiz atamasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </DialogContentText>
                    {selectedAssignment && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2">
                                <strong>Kullanıcı:</strong> {selectedAssignment.userId?.name} {selectedAssignment.userId?.surname}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Quiz:</strong> {selectedAssignment.quizSetId?.title}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default QuizAssignmentList;
