import { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    Stack,
    LinearProgress,
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { bulkInterviewInvitationService } from 'src/services/interviewServices';
import toast from 'react-hot-toast';

interface BulkInvitationDialogProps {
    open: boolean;
    onClose: () => void;
    interviewId: string;
}

interface CandidatePreview {
    firstName: string;
    lastName: string;
    identityNumber: string;
    phone: string;
    email: string;
}

interface BulkInvitationResult {
    success: {
        name: string;
        email: string;
        interviewId: string;
    }[];
    failed: {
        name: string;
        email: string;
        error: string;
    }[];
    total: number;
}

export default function BulkInvitationDialog({
    open,
    onClose,
    interviewId,
}: BulkInvitationDialogProps) {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [interviewType, setInterviewType] = useState<'video' | 'text'>('video');
    const [candidates, setCandidates] = useState<CandidatePreview[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [result, setResult] = useState<BulkInvitationResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const bulkInviteMutation = useMutation({
        mutationFn: bulkInterviewInvitationService,
        onSuccess: (data) => {
            setResult(data.results);
            toast.success(data.message || 'Toplu davet başarılı!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Bir hata oluştu');
        },
    });

    const parseExcelFile = useCallback((file: File) => {
        // Bu sadece preview için, gerçek parse backend'de yapılacak
        // Excel okuma için xlsx kütüphanesi kullanılabilir
        const reader = new FileReader();
        reader.onload = (e) => {
            // Şimdilik basit bir implementation
            // Gerçekte xlsx kütüphanesi ile parse edilmeli
            setCandidates([]);
            setErrors([]);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleFileSelect = (file: File) => {
        if (!file) return;

        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Dosya boyutu 2MB\'dan küçük olmalıdır');
            return;
        }

        setSelectedFile(file);
        parseExcelFile(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = () => {
        if (!selectedFile) {
            toast.error('Lütfen bir Excel dosyası seçin');
            return;
        }

        bulkInviteMutation.mutate({
            interviewId,
            excelFile: selectedFile,
            interviewType,
        });
    };

    const handleClose = () => {
        setSelectedFile(null);
        setCandidates([]);
        setErrors([]);
        setResult(null);
        setInterviewType('video');
        onClose();
    };

    const downloadErrorReport = () => {
        if (!result) return;

        const csv = [
            'Ad Soyad,Email,Hata',
            ...result.failed.map((f) => `${f.name},${f.email},${f.error}`),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'davet-hatalari.csv';
        link.click();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Toplu Mülakat Daveti</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    {/* Interview Type Selection */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Mülakat Tipi</InputLabel>
                        <Select
                            value={interviewType}
                            onChange={(e) => setInterviewType(e.target.value as 'video' | 'text')}
                            label="Mülakat Tipi"
                            disabled={bulkInviteMutation.isLoading}
                        >
                            <MenuItem value="video">Görüntülü Mülakat</MenuItem>
                            <MenuItem value="text">Yazılı Mülakat</MenuItem>
                        </Select>
                    </FormControl>

                    {/* File Upload Area */}
                    {!result && (
                        <Paper
                            variant="outlined"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                bgcolor: isDragging ? 'action.hover' : 'background.paper',
                                border: isDragging ? '2px dashed' : '1px solid',
                                borderColor: isDragging ? 'primary.main' : 'divider',
                                transition: 'all 0.2s',
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                onChange={handleFileInputChange}
                            />

                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

                            <Typography variant="h6" gutterBottom>
                                {selectedFile ? selectedFile.name : 'Excel dosyası seçin veya sürükleyin'}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Desteklenen format: .xlsx, .xls (Max 2MB)
                            </Typography>

                            <Box mt={2}>
                                <Chip label="Ad" size="small" sx={{ mr: 1 }} />
                                <Chip label="Soyad" size="small" sx={{ mr: 1 }} />
                                <Chip label="T.C. No" size="small" sx={{ mr: 1 }} />
                                <Chip label="Telefon" size="small" sx={{ mr: 1 }} />
                                <Chip label="Email" size="small" />
                            </Box>
                        </Paper>
                    )}

                    {/* Loading */}
                    {bulkInviteMutation.isLoading && (
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Davetler gönderiliyor...
                            </Typography>
                            <LinearProgress />
                        </Box>
                    )}

                    {/* Errors */}
                    {errors.length > 0 && (
                        <Alert severity="error">
                            <Typography variant="subtitle2" gutterBottom>
                                Aşağıdaki hatalar bulundu:
                            </Typography>
                            {errors.map((error, index) => (
                                <Typography key={index} variant="body2">
                                    • {error}
                                </Typography>
                            ))}
                        </Alert>
                    )}

                    {/* Result Summary */}
                    {result && (
                        <Box>
                            <Stack direction="row" spacing={2} mb={2}>
                                <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.lighter' }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CheckCircleIcon color="success" />
                                        <Box>
                                            <Typography variant="h4">{result.success.length}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Başarılı
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 2, flex: 1, bgcolor: 'error.lighter' }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <ErrorIcon color="error" />
                                        <Box>
                                            <Typography variant="h4">{result.failed.length}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Başarısız
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Stack>

                            {/* Failed Invitations Table */}
                            {result.failed.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Başarısız Davetler:
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ad Soyad</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Hata</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {result.failed.map((failure, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{failure.name}</TableCell>
                                                        <TableCell>{failure.email}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="error">
                                                                {failure.error}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Box mt={2}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={downloadErrorReport}
                                        >
                                            Hata Raporunu İndir
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={bulkInviteMutation.isLoading}>
                    {result ? 'Kapat' : 'İptal'}
                </Button>

                {!result && (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!selectedFile || bulkInviteMutation.isLoading}
                    >
                        Davetleri Gönder
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
