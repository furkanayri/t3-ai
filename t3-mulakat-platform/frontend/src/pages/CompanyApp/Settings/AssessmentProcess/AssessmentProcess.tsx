import { useState } from 'react';
import {
    Box, Button, Card, CardContent, CircularProgress, IconButton, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Tooltip, Typography, FormControlLabel, Switch, Chip,
} from '@mui/material';
import { Add as AddIcon, EditOutlined, DeleteOutline, GroupAdd as GroupAddIcon, AccountTreeOutlined } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { ConfirmAction } from 'src/components/shared';
import { array } from 'src/utils';
import {
    useGetAssessmentProcessesQuery,
    useCreateAssessmentProcessMutation,
    useDeleteAssessmentProcessMutation,
} from 'src/hooks/useServices/useAssessmentServices';
import StageEditorDialog from './StageEditorDialog';
import AssignDialog from './AssignDialog';

const BRAND = '#E31E24';

const AssessmentProcess = () => {
    const { enqueueSnackbar } = useSnackbar();
    const processesQuery = useGetAssessmentProcessesQuery();
    const createProcess = useCreateAssessmentProcessMutation();
    const deleteProcess = useDeleteAssessmentProcessMutation();

    const processes = array(processesQuery?.data?.results);

    const [editorProcessId, setEditorProcessId] = useState<string | null>(null);
    const [assignProcess, setAssignProcess] = useState<{ id: string; title: string } | null>(null);

    const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
        initialValues: { title: '', description: '', sequential: true },
        onSubmit: (value, helpers) => {
            createProcess.mutateAsync(value, {
                onSuccess: () => {
                    enqueueSnackbar('Değerlendirme süreci oluşturuldu', { variant: 'success' });
                    helpers.resetForm();
                    processesQuery.refetch();
                },
                onError: () => enqueueSnackbar('Süreç oluşturulamadı', { variant: 'error' }),
            });
        },
    });

    const handleDelete = (id: string) => {
        deleteProcess.mutateAsync({ processId: id }, {
            onSuccess: () => {
                enqueueSnackbar('Süreç silindi', { variant: 'success' });
                processesQuery.refetch();
            },
            onError: () => enqueueSnackbar('Süreç silinemedi', { variant: 'error' }),
        });
    };

    return (
        <Box sx={{ width: '75%', p: 3 }}>
            <Box sx={{ maxWidth: 1200 }}>
                <Card elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={600}>Değerlendirme Süreçleri</Typography>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <TextField size="small" label="Süreç Adı" name="title" value={values.title} onChange={handleChange} required inputProps={{ maxLength: 60 }} sx={{ flexGrow: 1 }} />
                                    <TextField size="small" label="Açıklama" name="description" value={values.description} onChange={handleChange} inputProps={{ maxLength: 160 }} sx={{ flexGrow: 2 }} />
                                    <FormControlLabel control={<Switch checked={values.sequential} onChange={(e) => setFieldValue('sequential', e.target.checked)} />} label="Sıralı" />
                                    <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={isSubmitting} sx={{ height: 37, bgcolor: BRAND, '&:hover': { bgcolor: BRAND } }}>
                                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Oluştur'}
                                    </Button>
                                </Box>
                            </form>
                        </Box>

                        <Box sx={{ px: 2, pb: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: '#f9fafb', fontWeight: 600 } }}>
                                        <TableCell>Ad</TableCell>
                                        <TableCell>Açıklama</TableCell>
                                        <TableCell>Sıralı</TableCell>
                                        <TableCell align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {processesQuery.isLoading && (
                                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress size={22} /></TableCell></TableRow>
                                    )}
                                    {!processesQuery.isLoading && processes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                <AccountTreeOutlined sx={{ fontSize: 40, color: '#bdbdbd' }} />
                                                <Typography color="text.secondary">Henüz değerlendirme süreci yok</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {processes.map((process: any) => (
                                        <TableRow key={process._id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell><Typography fontWeight={500}>{process.title}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" color="text.secondary">{process.description || '-'}</Typography></TableCell>
                                            <TableCell>
                                                <Chip size="small" label={process.sequential ? 'Evet' : 'Hayır'} color={process.sequential ? 'success' : 'default'} variant="outlined" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                                    <Tooltip title="Aşamalar">
                                                        <IconButton size="small" sx={{ color: BRAND, border: '1px solid #e0e0e0' }} onClick={() => setEditorProcessId(process._id)}>
                                                            <EditOutlined fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ata">
                                                        <IconButton size="small" sx={{ color: '#2196f3', border: '1px solid #e0e0e0' }} onClick={() => setAssignProcess({ id: process._id, title: process.title })}>
                                                            <GroupAddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <ConfirmAction title="Süreci Sil" description="Bu değerlendirme sürecini silmek istediğinize emin misiniz?" onConfirm={async () => handleDelete(process._id)}>
                                                        <Tooltip title="Sil">
                                                            <IconButton size="small" sx={{ color: '#f44336', border: '1px solid #e0e0e0' }}>
                                                                <DeleteOutline fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </ConfirmAction>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {editorProcessId && (
                <StageEditorDialog open={!!editorProcessId} processId={editorProcessId} onClose={() => setEditorProcessId(null)} />
            )}
            {assignProcess && (
                <AssignDialog open={!!assignProcess} processId={assignProcess.id} processTitle={assignProcess.title} onClose={() => setAssignProcess(null)} />
            )}
        </Box>
    );
};

export default AssessmentProcess;
