import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardContent, Chip, CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useDialog } from 'src/hooks/use-dialog';
import { ConfirmAction } from 'src/components/shared';
import { useCreateInterviewMutation, useDeleteInterviewMutation, useGetAiInterviewQuery } from 'src/hooks/useServices/useInterviewServices';
import { array } from 'src/utils';
import { Add as AddIcon, EditOutlined as EditOutlinedIcon, DeleteOutline as DeleteOutlineIcon, QuestionAnswerOutlined as QuestionAnswerOutlinedIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material'; // MUI ikonları
import { QuestionDialog } from './components';
import BulkInvitationDialog from './components/BulkInvitationDialog';

const Interviews = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data, handleClose, handleOpen, open } = useDialog();
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [selectedInterviewId, setSelectedInterviewId] = useState<string>('');

    const createInterviewMutation = useCreateInterviewMutation();
    const interviewQuery = useGetAiInterviewQuery();
    const deleteInterviewMutation = useDeleteInterviewMutation();

    const interviews = array(interviewQuery?.data?.results);
    const { values, handleSubmit, handleChange, isSubmitting, handleBlur, touched, errors } = useFormik({
        initialValues: {
            name: "",
            description: ""
        },
        onSubmit: (value, helpers) => {
            const payload = {
                name: value.name,
                description: value.description
            };
            createInterviewMutation.mutateAsync(payload, {
                onSuccess(data, variables, context) {
                    enqueueSnackbar(t('Interview Created Successfully'), { variant: 'success' });
                    helpers.resetForm();
                    interviewQuery.refetch();
                },
                onError(error, variables, context) {
                    enqueueSnackbar(t('InterviewError'), { variant: 'error' });
                },
            });
        }
    });

    const handleDeleteinterview = (id: string) => {
        deleteInterviewMutation.mutateAsync({ id }, {
            onSuccess(data) {
                enqueueSnackbar('Interview Deleted Successfully', { variant: 'success' });
                interviewQuery.refetch();
            },
            onError(error) {
                enqueueSnackbar(t('deleted error'), { variant: 'error' });
            },
        });
    };

    const handleOpenBulkDialog = (interviewId: string) => {
        setSelectedInterviewId(interviewId);
        setBulkDialogOpen(true);
    };

    const handleCloseBulkDialog = () => {
        setBulkDialogOpen(false);
        setSelectedInterviewId('');
    };

    return (
        <Box
            sx={{
                width: "70%",
                justifyContent: 'center',
                p: 3,

            }}
        >
            <Box sx={{ maxWidth: '1200px' }}>
                <QuestionDialog
                    open={open}
                    handleClose={handleClose}
                    refetch={() => interviewQuery.refetch()}
                    data={data}
                />

                <BulkInvitationDialog
                    open={bulkDialogOpen}
                    onClose={handleCloseBulkDialog}
                    interviewId={selectedInterviewId}
                />

                <Card
                    elevation={0}
                    sx={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden'
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        <Box
                            sx={{
                                bgcolor: '#f5f7fa',
                                p: 2,
                                borderBottom: '1px solid #e0e0e0',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="h6" fontWeight={600} textAlign="center">
                                {t('Interview Management')}
                            </Typography>
                        </Box>
                        <Box component="main" flexGrow={1} sx={{ p: 3 }}>
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 6, maxWidth: '100%' }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <TextField
                                            fullWidth
                                            label={t("name")}
                                            name="name"
                                            onChange={handleChange}
                                            value={values.name ?? ''}
                                            size="small"
                                            onBlur={handleBlur}
                                            error={touched.name && !!errors.name}
                                            helperText={touched.name && errors.name}
                                            required
                                            inputProps={{ maxLength: 50 }}
                                        />
                                    </Box>
                                    <Box sx={{ flexGrow: 2 }}>
                                        <TextField
                                            fullWidth
                                            label={t("description")}
                                            name="description"
                                            onChange={handleChange}
                                            value={values.description ?? ''}
                                            size="small"
                                            onBlur={handleBlur}
                                            error={touched.description && !!errors.description}
                                            helperText={touched.description && errors.description}
                                            inputProps={{ maxLength: 100 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            disabled={isSubmitting}
                                            sx={{
                                                height: '37px',
                                                borderRadius: '6px',
                                                backgroundColor: '#E31E24',
                                                textTransform: 'none',
                                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                                '&:hover': {
                                                    backgroundColor: '#E31E24',
                                                }
                                            }}
                                        >
                                            {isSubmitting ?
                                                <CircularProgress size={20} color="inherit" /> :
                                                t('Create')
                                            }
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        </Box>

                        <Box component="main" flexGrow={1} sx={{ px: 2 }}>


                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{
                                        "& .MuiTableCell-root": {
                                            backgroundColor: '#f9fafb',
                                            fontWeight: 600,
                                            borderBottom: '2px solid #e0e0e0'
                                        }
                                    }}>
                                        <TableCell>{t('name')}</TableCell>
                                        <TableCell>{t('description')}</TableCell>
                                        <TableCell align='right'>{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {interviews?.map((interview: any) => (
                                        <TableRow
                                            key={interview?._id}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                },
                                                '& .MuiTableCell-root': {
                                                    borderBottom: '1px solid #eeeeee'
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Typography fontWeight={500}>
                                                        {interview?.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {interview?.description || t('No description')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align='right'>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                                    <Tooltip title="Toplu Davet">
                                                        <IconButton
                                                            onClick={() => handleOpenBulkDialog(interview?._id)}
                                                            size="small"
                                                            sx={{
                                                                color: '#2196f3',
                                                                border: '1px solid #e0e0e0',
                                                                "&:hover": {
                                                                    backgroundColor: "#e3f2fd"
                                                                }
                                                            }}
                                                        >
                                                            <GroupAddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={t("Edit")}>
                                                        <IconButton
                                                            onClick={() => handleOpen(interview)}
                                                            size="small"
                                                            sx={{
                                                                color: '#4caf50',
                                                                border: '1px solid #e0e0e0',
                                                                "&:hover": {
                                                                    backgroundColor: "#e8f5e9"
                                                                }
                                                            }}
                                                        >
                                                            <EditOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <ConfirmAction
                                                        title={t('Delete Interview')}
                                                        description={t('SureDeleteThisInterview')}
                                                        onConfirm={async () => {
                                                            handleDeleteinterview(interview?._id);
                                                        }}
                                                    >
                                                        <Tooltip title={t("Delete")}>
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    color: '#f44336',
                                                                    border: '1px solid #e0e0e0',
                                                                    "&:hover": {
                                                                        backgroundColor: "#ffebee"
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteOutlineIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </ConfirmAction>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {interviews?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                    <QuestionAnswerOutlinedIcon sx={{ fontSize: 40, color: '#bdbdbd' }} />
                                                    <Typography color="text.secondary">
                                                        {t('No interviews found')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
{/* will be add future automated interview */ }
{/* <div className='flex-1 max-w-3xl w-full pt-12'>
                <Card>
                    <CardContent>
                        <div className='text-end'>
                            <FormControlLabel control={<Switch />} label="interview automation" />
                            <IconButton>
                                <HelpIcon />
                            </IconButton>
                        </div>
                        <div>

                        </div>
                    </CardContent>
                </Card>
            </div> */}

export default Interviews;