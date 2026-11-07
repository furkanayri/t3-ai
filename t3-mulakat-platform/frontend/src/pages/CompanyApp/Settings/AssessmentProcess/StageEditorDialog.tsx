import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography,
    FormControl, InputLabel, Select, MenuItem, TextField, Switch, FormControlLabel,
    IconButton, Chip, Divider, CircularProgress,
} from '@mui/material';
import { DragIndicator, DeleteOutline, Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useSnackbar } from 'notistack';
import { array } from 'src/utils';
import { useGetAiInterviewQuery } from 'src/hooks/useServices/useInterviewServices';
import { useGetAllQuizSetsQuery } from 'src/hooks/useServices/useQuizSet';
import {
    useGetAssessmentProcessQuery,
    useCreateAssessmentStageMutation,
    useDeleteAssessmentStageMutation,
    useReorderAssessmentStagesMutation,
} from 'src/hooks/useServices/useAssessmentServices';

const BRAND = '#E31E24';

const STAGE_TYPES = [
    { value: 'personality_test', label: 'Kişilik Envanteri Testi' },
    { value: 'text_interview', label: 'Yazılı Mülakat' },
    { value: 'video_interview', label: 'Görüntülü Mülakat' },
    { value: 'quiz', label: 'Quiz / Sınav' },
];

const typeLabel = (type: string) => STAGE_TYPES.find((t) => t.value === type)?.label ?? type;

export default function StageEditorDialog({ open, onClose, processId }: { open: boolean; onClose: () => void; processId: string }) {
    const { enqueueSnackbar } = useSnackbar();
    const processQuery = useGetAssessmentProcessQuery({ processId });
    const createStage = useCreateAssessmentStageMutation();
    const deleteStage = useDeleteAssessmentStageMutation();
    const reorderStages = useReorderAssessmentStagesMutation();

    const interviewsQuery = useGetAiInterviewQuery();
    const quizSetsQuery = useGetAllQuizSetsQuery();

    const interviews: any[] = array(interviewsQuery?.data?.results);
    const quizSets: any[] = array(quizSetsQuery?.data?.results ?? quizSetsQuery?.data?.data?.results ?? quizSetsQuery?.data?.data);

    const process = processQuery?.data?.assessmentProcess;
    const stages = array(process?.stagesSort);

    const [type, setType] = useState('personality_test');
    const [refId, setRefId] = useState('');
    const [title, setTitle] = useState('');
    const [required, setRequired] = useState(true);
    const [deadlineDays, setDeadlineDays] = useState(7);

    const needsRef = type === 'text_interview' || type === 'video_interview' || type === 'quiz';
    const refOptions = type === 'quiz' ? quizSets : interviews;

    const resetForm = () => {
        setType('personality_test');
        setRefId('');
        setTitle('');
        setRequired(true);
        setDeadlineDays(7);
    };

    const handleAdd = () => {
        if (needsRef && !refId) {
            enqueueSnackbar('Lütfen bu aşama için bir kaynak seçin', { variant: 'warning' });
            return;
        }
        createStage.mutateAsync({
            processId,
            payload: { type, refId: needsRef ? refId : null, title: title || typeLabel(type), required, deadlineDays },
        }, {
            onSuccess: () => {
                enqueueSnackbar('Aşama eklendi', { variant: 'success' });
                resetForm();
                processQuery.refetch();
            },
            onError: () => enqueueSnackbar('Aşama eklenemedi', { variant: 'error' }),
        });
    };

    const handleDelete = (stageId: string) => {
        deleteStage.mutateAsync({ processId, stageId }, {
            onSuccess: () => {
                enqueueSnackbar('Aşama silindi', { variant: 'success' });
                processQuery.refetch();
            },
            onError: () => enqueueSnackbar('Aşama silinemedi', { variant: 'error' }),
        });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) return;
        const reordered = Array.from(stages);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        const stagesSort = reordered.map((s: any) => s._id);
        reorderStages.mutateAsync({ processId, stagesSort }, {
            onSuccess: () => processQuery.refetch(),
            onError: () => enqueueSnackbar('Sıralama güncellenemedi', { variant: 'error' }),
        });
    };

    const refName = (stage: any) => {
        if (stage.type === 'quiz') return quizSets.find((q: any) => q._id === String(stage.refId))?.title;
        if (stage.type === 'text_interview' || stage.type === 'video_interview') return interviews.find((i: any) => i._id === String(stage.refId))?.name;
        return null;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ color: BRAND }}>{process?.title} - Aşamalar</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Yeni Aşama Ekle</Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Aşama Tipi</InputLabel>
                            <Select label="Aşama Tipi" value={type} onChange={(e) => { setType(e.target.value); setRefId(''); }}>
                                {STAGE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                            </Select>
                        </FormControl>

                        {needsRef && (
                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>{type === 'quiz' ? 'Quiz Seti' : 'Mülakat'}</InputLabel>
                                <Select label={type === 'quiz' ? 'Quiz Seti' : 'Mülakat'} value={refId} onChange={(e) => setRefId(e.target.value)}>
                                    {refOptions.map((o: any) => (
                                        <MenuItem key={o._id} value={o._id}>{o.title || o.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <TextField size="small" label="Başlık (ops.)" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <TextField size="small" type="number" label="Süre (gün)" sx={{ width: 110 }} value={deadlineDays} onChange={(e) => setDeadlineDays(Number(e.target.value))} inputProps={{ min: 1 }} />
                        <FormControlLabel control={<Switch checked={required} onChange={(e) => setRequired(e.target.checked)} />} label="Zorunlu" />
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={createStage.isLoading} sx={{ bgcolor: BRAND, '&:hover': { bgcolor: BRAND } }}>
                            {createStage.isLoading ? <CircularProgress size={18} color="inherit" /> : 'Ekle'}
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Aşamalar (sürükleyerek sıralayın)</Typography>
                {processQuery.isLoading ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={22} /></Box>
                ) : stages.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ py: 2 }}>Henüz aşama eklenmedi.</Typography>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="stages">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {stages.map((stage: any, index: number) => (
                                        <Draggable key={stage._id} draggableId={String(stage._id)} index={index}>
                                            {(prov, snapshot) => (
                                                <div
                                                    ref={prov.innerRef}
                                                    {...prov.draggableProps}
                                                    {...prov.dragHandleProps}
                                                    style={{ ...prov.draggableProps.style }}
                                                >
                                                    <Stack direction="row" alignItems="center" spacing={1.5}
                                                        sx={{ p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: snapshot.isDragging ? '#fff5f5' : '#fff' }}>
                                                        <DragIndicator color="disabled" />
                                                        <Chip size="small" label={index + 1} sx={{ bgcolor: `${BRAND}14`, color: BRAND, fontWeight: 700 }} />
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body2" fontWeight={600}>{stage.title || typeLabel(stage.type)}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {typeLabel(stage.type)}{refName(stage) ? ` • ${refName(stage)}` : ''} • {stage.required ? 'Zorunlu' : 'Opsiyonel'} • {stage.deadlineDays} gün
                                                            </Typography>
                                                        </Box>
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(stage._id)}>
                                                            <DeleteOutline fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Kapat</Button>
            </DialogActions>
        </Dialog>
    );
}
