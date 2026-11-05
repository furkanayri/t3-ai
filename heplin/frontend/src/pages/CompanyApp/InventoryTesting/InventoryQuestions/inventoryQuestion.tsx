import React, { useState, useMemo } from 'react';
import {
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Chip,
    Box,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add, Edit, Delete, ToggleOn, ToggleOff } from '@mui/icons-material';
import { Edit02Icon, Delete01Icon, Add01Icon } from 'hugeicons-react';
import InterviewQuestionCreateDialog from './components/InterviewQuestionCreateDialog';
import {
    useGetAllInterviewQuestionsQuery,
    useDeleteInterviewQuestionMutation,
    useToggleInterviewQuestionStatusMutation
} from 'src/hooks/useServices/useInterviewQuestionServices';
import { useGetAllDimensionsQuery } from 'src/hooks/useServices/useDimensionServices';
import { array } from 'src/utils';
import { CustomButton, ConfirmAction } from 'src/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';

interface Dimension {
    _id: string;
    dimensionCode: string;
    name: {
        tr: string;
        en: string;
    };
    isActive: boolean;
}

interface InterviewQuestion {
    _id: string;
    dimensionId?: string;
    customDimensionId?: string;
    scoreRange: {
        min: number;
        max: number;
    };
    question: {
        tr: string;
        en: string;
    };
    purpose: {
        tr: string;
        en: string;
    };
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const InventoryQuestion = () => {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const currentLang = i18n.language as 'tr' | 'en';
    const { companySlug } = useParams();

    const [filters, setFilters] = useState({
        isActive: undefined as boolean | undefined,
        dimensionId: undefined as string | undefined,
        order: undefined as string | undefined
    });

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
    const navigate = useNavigate()

    // Build query string
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.isActive !== undefined) {
            params.append('isActive', filters.isActive.toString());
        }
        if (filters.dimensionId) {
            params.append('dimensionId', filters.dimensionId);
        }
        if (filters.order) {
            params.append('order', filters.order);
        }
        return params.toString();
    }, [filters]);

    // Queries and mutations
    const questionsQuery = useGetAllInterviewQuestionsQuery(queryString);
    const dimensionsQuery = useGetAllDimensionsQuery('isActive=true');
    const deleteMutation = useDeleteInterviewQuestionMutation();
    const toggleStatusMutation = useToggleInterviewQuestionStatusMutation();

    const questionsData = array<InterviewQuestion>(questionsQuery.data);
    const dimensions = array<Dimension>(dimensionsQuery.data);

    // Handlers
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({ id });
            queryClient.invalidateQueries(['interviewQuestions']);
            toast.success(t('Interview question deleted successfully'));
        } catch (error: any) {
            toast.error(error?.response?.data?.error || t('Failed to delete interview question'));
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleStatusMutation.mutateAsync({ id });
            queryClient.invalidateQueries(['interviewQuestions']);
            toast.success(t('Question status updated'));
        } catch (error: any) {
            toast.error(error?.response?.data?.error || t('Failed to update status'));
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };



    if (questionsQuery.isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (questionsQuery.isError) {
        return (
            <Alert severity="error">
                {t('Error loading interview questions')}
            </Alert>
        );
    }

    return (
        <div className="flex flex-col space-y-6 pr-[55px]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="text-2xl font-semibold text-gray-900">
                        {t('Interview Questions')}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-1">
                        {t('Manage personality inventory interview questions')}
                    </Typography>
                </div>
                <div className='flex gap-1'>

                    <CustomButton
                        startIcon={<Add01Icon size={20} />}
                        onClick={() => {
                            navigate(`/${companySlug}/inventory-testing/inventory-testing-tests`)
                        }}
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        Add Tests
                    </CustomButton>
                    <CustomButton
                        startIcon={<Add01Icon size={20} />}
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        {t('Add Question')}
                    </CustomButton>
                </div>

            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2 flex-wrap">
                    {/* Status Filters */}
                    <Chip
                        label={t('All')}
                        variant={filters.isActive === undefined ? 'filled' : 'outlined'}
                        onClick={() => handleFilterChange('isActive', undefined)}
                        className="cursor-pointer"
                    />
                    <Chip
                        label={t('Active')}
                        variant={filters.isActive === true ? 'filled' : 'outlined'}
                        onClick={() => handleFilterChange('isActive', true)}
                        className="cursor-pointer"
                        color="success"
                    />
                    <Chip
                        label={t('Inactive')}
                        variant={filters.isActive === false ? 'filled' : 'outlined'}
                        onClick={() => handleFilterChange('isActive', false)}
                        className="cursor-pointer"
                        color="error"
                    />

                    {/* Dimension Filters */}
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    {dimensions.slice(0, 3).map((dimension) => (
                        <Chip
                            key={dimension._id}
                            label={dimension.dimensionCode}
                            variant={filters.dimensionId === dimension._id ? 'filled' : 'outlined'}
                            onClick={() => handleFilterChange('dimensionId', filters.dimensionId === dimension._id ? undefined : dimension._id)}
                            className="cursor-pointer"
                            color="primary"
                        />
                    ))}
                </div>
            </div>

            {/* Table */}
            {questionsData.length === 0 ? (
                <Alert severity="info">
                    {t('No interview questions found')}
                </Alert>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHead className="bg-gray-50">
                            <TableRow>
                                <TableCell className="font-semibold text-gray-900">
                                    {t('Question')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900">
                                    {t('Purpose')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900" align="center">
                                    {t('Score Range')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900" align="center">
                                    {t('Order')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900" align="center">
                                    {t('Status')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900" align="right">
                                    {t('Actions')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questionsData.map((question) => (
                                <TableRow
                                    key={question._id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell>
                                        <div className="max-w-md">
                                            <Typography variant="body2" className="font-medium text-gray-900">
                                                {question.question[currentLang] || question.question.tr}
                                            </Typography>
                                            {question.dimensionId && (
                                                <div className="mt-1">
                                                    <Chip
                                                        label={dimensions.find(d => d._id === question.dimensionId)?.dimensionCode || 'Unknown'}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        className="text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" className="text-gray-600">
                                            {question.purpose[currentLang] || question.purpose.tr}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" className="text-gray-600">
                                            {question.scoreRange.min} - {question.scoreRange.max}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`#${question.order}`}
                                            size="small"
                                            variant="outlined"
                                            color="default"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={question.isActive ? t('Active') : t('Inactive')}
                                            color={question.isActive ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip title={t('Edit')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingQuestion(question);
                                                        setCreateDialogOpen(true);
                                                    }}
                                                    className="text-gray-600 hover:text-blue-600"
                                                >
                                                    <Edit02Icon size={18} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={question.isActive ? t('Deactivate') : t('Activate')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleStatus(question._id)}
                                                    disabled={toggleStatusMutation.isLoading}
                                                    className={question.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-green-600'}
                                                >
                                                    {question.isActive ? <ToggleOn /> : <ToggleOff />}
                                                </IconButton>
                                            </Tooltip>

                                            <ConfirmAction
                                                title={t('Confirm Deletion')}
                                                description={t('Are you sure you want to delete this interview question? This action cannot be undone.')}
                                                onConfirm={() => handleDelete(question._id)}
                                            >
                                                <Tooltip title={t('Delete')}>
                                                    <IconButton
                                                        size="small"
                                                        disabled={deleteMutation.isLoading}
                                                        className="text-gray-600 hover:text-red-600"
                                                    >
                                                        <Delete01Icon size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </ConfirmAction>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Loading states */}
            {(deleteMutation.isLoading || toggleStatusMutation.isLoading) && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgcolor="rgba(0,0,0,0.1)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={9999}
                >
                    <CircularProgress />
                </Box>
            )}

            {/* Create/Edit Dialog */}
            <InterviewQuestionCreateDialog
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                    setEditingQuestion(null);
                }}
                mode={editingQuestion ? 'edit' : 'create'}
                initialValues={editingQuestion ? {
                    dimensionId: editingQuestion.dimensionId || '',
                    customDimensionId: editingQuestion.customDimensionId || '',
                    scoreRange: editingQuestion.scoreRange,
                    question: editingQuestion.question,
                    purpose: editingQuestion.purpose,
                    order: editingQuestion.order,
                    isActive: editingQuestion.isActive
                } : undefined}
                questionId={editingQuestion?._id}
                onSuccess={() => {
                    setCreateDialogOpen(false);
                    setEditingQuestion(null);
                }}
            />
        </div>
    );
};

export default InventoryQuestion;