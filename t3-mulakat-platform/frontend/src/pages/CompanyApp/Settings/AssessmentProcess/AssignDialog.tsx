import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Alert, CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAssignAssessmentProcessMutation } from 'src/hooks/useServices/useAssessmentServices';

const BRAND = '#E31E24';

export default function AssignDialog({ open, onClose, processId, processTitle }: { open: boolean; onClose: () => void; processId: string; processTitle?: string }) {
    const { enqueueSnackbar } = useSnackbar();
    const assign = useAssignAssessmentProcessMutation();
    const [userIdsText, setUserIdsText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [result, setResult] = useState<{ success: any[]; failed: any[] } | null>(null);

    const handleAssign = () => {
        const userIds = userIdsText.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
        if (userIds.length === 0) {
            enqueueSnackbar('En az bir kullanıcı ID girin', { variant: 'warning' });
            return;
        }
        assign.mutateAsync({ processId, userIds, dueDate: dueDate || undefined }, {
            onSuccess: (data) => {
                setResult(data?.results ?? null);
                enqueueSnackbar('Atama tamamlandı', { variant: 'success' });
            },
            onError: () => enqueueSnackbar('Atama sırasında hata oluştu', { variant: 'error' }),
        });
    };

    const handleClose = () => {
        setUserIdsText('');
        setDueDate('');
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: BRAND }}>Süreç Ata - {processTitle}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        Kullanıcı ID'lerini virgül, boşluk veya satır ile ayırarak girin.
                    </Typography>
                    <TextField
                        label="Kullanıcı ID'leri"
                        multiline
                        minRows={3}
                        value={userIdsText}
                        onChange={(e) => setUserIdsText(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Son Teslim Tarihi (ops.)"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    {result && (
                        <Alert severity={result.failed.length ? 'warning' : 'success'}>
                            {result.success.length} başarılı, {result.failed.length} başarısız.
                            {result.failed.length > 0 && (
                                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                                    {result.failed.map((f, i) => (
                                        <li key={i}><Typography variant="caption">{f.userId}: {f.error}</Typography></li>
                                    ))}
                                </ul>
                            )}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Kapat</Button>
                <Button variant="contained" onClick={handleAssign} disabled={assign.isLoading} sx={{ bgcolor: BRAND, '&:hover': { bgcolor: BRAND } }}>
                    {assign.isLoading ? <CircularProgress size={18} color="inherit" /> : 'Ata'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
