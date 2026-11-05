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
    Typography,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add, Delete, DragIndicator, AccessTime, CheckCircle, Cancel } from '@mui/icons-material';
import { Delete01Icon, Add01Icon, DragDropIcon, Time01Icon } from 'hugeicons-react';
import {
    useGetAllTestQuestionsQuery,
    useAddTestQuestionMutation,
    useRemoveTestQuestionMutation
} from 'src/hooks/useServices/useTestQuestionServices';
import { useGetAllPersonalityTestsQuery } from 'src/hooks/useServices/usePersonalityTestServices';
import { useGetAllInterviewQuestionsQuery } from 'src/hooks/useServices/useInterviewQuestionServices';
import { array } from 'src/utils';
import { CustomButton, ConfirmAction } from 'src/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface TestQuestion {
    _id: string;
    testId: string;
    questionId: {
        _id: string;
        questionCode: string;
        text: {
            tr: string;
            en: string;
        };
        inputType: string;
    };
    order: number;
    timeLimit: number | null;
    timeLimitEnabled: boolean;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
}

interface PersonalityTest {
    _id: string;
    testCode: string;
    name: {
        tr: string;
        en: string;
    };
    isActive: boolean;
}

interface Question {
    _id: string;
    questionCode: string;
    text: {
        tr: string;
        en: string;
    };
    inputType: string;
    isActive: boolean;
}

const InventoryTestQuestions = () => {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const currentLang = i18n.language as 'tr' | 'en';

    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);

    // Form states for add question dialog
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
    const [questionOrder, setQuestionOrder] = useState<number>(1);
    const [questionTimeLimit, setQuestionTimeLimit] = useState<number | null>(null);
    const [questionTimeLimitEnabled, setQuestionTimeLimitEnabled] = useState<boolean>(false);
    const [questionIsRequired, setQuestionIsRequired] = useState<boolean>(true);

    // Queries
    const testsQuery = useGetAllPersonalityTestsQuery('isActive=true');
    const questionsQuery = useGetAllInterviewQuestionsQuery('isActive=true');
    const testQuestionsQuery = useGetAllTestQuestionsQuery(
        selectedTestId ? `testId=${selectedTestId}` : undefined,
        {
            enabled: !!selectedTestId, // Only run query when testId is selected
        }
    );

    // Mutations
    const addQuestionMutation = useAddTestQuestionMutation();
    const removeQuestionMutation = useRemoveTestQuestionMutation();

    const testsData = array<PersonalityTest>(testsQuery.data);
    const questionsData = array<Question>(questionsQuery.data);
    const testQuestionsData = array<TestQuestion>(testQuestionsQuery.data);

    const selectedTest = testsData.find(test => test._id === selectedTestId);

    // Get available questions (not already added to this test)
    const availableQuestions = questionsData.filter(question =>
        !testQuestionsData.some(tq => tq.questionId?._id === question._id)
    );

    // Handlers
    const handleAddQuestion = async () => {
        if (!selectedTestId || !selectedQuestionId) {
            toast.error(t('Please select test and question'));
            return;
        }

        try {
            await addQuestionMutation.mutateAsync({
                testId: selectedTestId,
                questionId: selectedQuestionId,
                order: questionOrder,
                timeLimit: questionTimeLimitEnabled ? questionTimeLimit : null,
                timeLimitEnabled: questionTimeLimitEnabled,
                isRequired: questionIsRequired
            });

            queryClient.invalidateQueries(['testQuestions']);
            toast.success(t('Question added to test successfully'));

            // Reset form
            setSelectedQuestionId('');
            setQuestionOrder(testQuestionsData.length + 1);
            setQuestionTimeLimit(null);
            setQuestionTimeLimitEnabled(false);
            setQuestionIsRequired(true);
            setAddQuestionDialogOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || t('Failed to add question'));
        }
    };

    const handleRemoveQuestion = async (testQuestionId: string) => {
        try {
            await removeQuestionMutation.mutateAsync({ testQuestionId });
            queryClient.invalidateQueries(['testQuestions']);
            toast.success(t('Question removed from test successfully'));
        } catch (error: any) {
            toast.error(error?.response?.data?.error || t('Failed to remove question'));
        }
    };

    const handleTestChange = (testId: string) => {
        setSelectedTestId(testId);
        setQuestionOrder(1); // Reset order
    };

    // Reset question order when testQuestionsData changes
    React.useEffect(() => {
        setQuestionOrder(testQuestionsData.length + 1);
    }, [testQuestionsData.length]);

    if (testsQuery.isLoading || questionsQuery.isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (testsQuery.isError || questionsQuery.isError) {
        return (
            <Alert severity="error">
                {t('Error loading data')}
            </Alert>
        );
    }

    return (
        <div className="flex flex-col space-y-6 pr-[55px]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="text-2xl font-semibold text-gray-900">
                        {t('Test Questions Management')}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-1">
                        {t('Manage questions for personality inventory tests')}
                    </Typography>
                </div>
            </div>

            {/* Test Selection */}
            <Card>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth>
                                <InputLabel>{t('Select Test')}</InputLabel>
                                <Select
                                    value={selectedTestId}
                                    label={t('Select Test')}
                                    onChange={(e) => handleTestChange(e.target.value as string)}
                                >
                                    {testsData.map((test) => (
                                        <MenuItem key={test._id} value={test._id}>
                                            <div>
                                                <Typography variant="body2" component="div">
                                                    {test.testCode} - {test.name?.[currentLang] || test.name?.tr || 'Unnamed Test'}
                                                </Typography>
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <CustomButton
                                startIcon={<Add01Icon size={20} />}
                                onClick={() => setAddQuestionDialogOpen(true)}
                                disabled={!selectedTestId || availableQuestions.length === 0}
                            >
                                {t('Add Question')}
                            </CustomButton>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Stats */}
            {selectedTestId && (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {testQuestionsData.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Total Questions')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {testQuestionsData.filter(tq => tq.isRequired).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Required Questions')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {testQuestionsData.filter(tq => tq.timeLimitEnabled).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Timed Questions')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {availableQuestions.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Available Questions')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Questions Table */}
            {selectedTestId ? (
                testQuestionsQuery.isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : testQuestionsData.length === 0 ? (
                    <Alert severity="info">
                        {t('No questions added to this test yet')}
                    </Alert>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell className="font-semibold text-gray-900" width="60px">
                                        {t('Order')}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900">
                                        {t('Question')}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900" align="center">
                                        {t('Input Type')}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900" align="center">
                                        {t('Time Limit')}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900" align="center">
                                        {t('Required')}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900" align="right">
                                        {t('Actions')}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {testQuestionsData.map((testQuestion) => (
                                    <TableRow
                                        key={testQuestion._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DragDropIcon size={16} className="text-gray-400" />
                                                <Chip
                                                    label={testQuestion.order}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <Typography variant="body2" className="font-medium text-gray-900">
                                                    {testQuestion.questionId?.text?.[currentLang] || testQuestion.questionId?.text?.tr || 'No question text'}
                                                </Typography>
                                                <Typography variant="caption" className="text-blue-600 font-mono">
                                                    {testQuestion.questionId?.questionCode || 'N/A'}
                                                </Typography>
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={testQuestion.questionId?.inputType || 'N/A'}
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {testQuestion.timeLimitEnabled && testQuestion.timeLimit ? (
                                                <Chip
                                                    icon={<Time01Icon size={14} />}
                                                    label={`${testQuestion.timeLimit}s`}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Typography variant="body2" className="text-gray-400">
                                                    {t('No limit')}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {testQuestion.isRequired ? (
                                                <CheckCircle className="text-green-500" fontSize="small" />
                                            ) : (
                                                <Cancel className="text-gray-400" fontSize="small" />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <ConfirmAction
                                                title={t('Confirm Removal')}
                                                description={t('Are you sure you want to remove this question from the test?')}
                                                onConfirm={() => handleRemoveQuestion(testQuestion._id)}
                                            >
                                                <Tooltip title={t('Remove Question')}>
                                                    <IconButton
                                                        size="small"
                                                        disabled={removeQuestionMutation.isLoading}
                                                        className="text-gray-600 hover:text-red-600"
                                                    >
                                                        <Delete01Icon size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </ConfirmAction>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
            ) : (
                <Alert severity="info">
                    {t('Please select a test to manage questions')}
                </Alert>
            )}

            {/* Add Question Dialog */}
            <Dialog
                open={addQuestionDialogOpen}
                onClose={() => setAddQuestionDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">
                        {t('Add Question to Test')}
                    </Typography>
                    {selectedTest && (
                        <Typography variant="caption" color="text.secondary">
                            {selectedTest.testCode} - {selectedTest.name?.[currentLang] || selectedTest.name?.tr || 'Unnamed Test'}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <FormControl fullWidth>
                            <InputLabel>{t('Select Question')}</InputLabel>
                            <Select
                                value={selectedQuestionId}
                                label={t('Select Question')}
                                onChange={(e) => setSelectedQuestionId(e.target.value as string)}
                            >
                                {availableQuestions.map((question) => (
                                    <MenuItem key={question._id} value={question._id}>
                                        <div className="w-full">
                                            <Typography variant="body2" component="div">
                                                {question.text?.[currentLang] || question.text?.tr || 'No question text'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {question.questionCode || 'N/A'} • {question.inputType || 'N/A'}
                                            </Typography>
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={t('Order')}
                                    value={questionOrder}
                                    onChange={(e) => setQuestionOrder(Number(e.target.value))}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={questionIsRequired}
                                            onChange={(e) => setQuestionIsRequired(e.target.checked)}
                                        />
                                    }
                                    label={t('Required')}
                                />
                            </Grid>
                        </Grid>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={questionTimeLimitEnabled}
                                    onChange={(e) => {
                                        setQuestionTimeLimitEnabled(e.target.checked);
                                        if (!e.target.checked) {
                                            setQuestionTimeLimit(null);
                                        }
                                    }}
                                />
                            }
                            label={t('Enable Time Limit')}
                        />

                        {questionTimeLimitEnabled && (
                            <TextField
                                fullWidth
                                type="number"
                                label={t('Time Limit (seconds)')}
                                value={questionTimeLimit || ''}
                                onChange={(e) => setQuestionTimeLimit(Number(e.target.value) || null)}
                                inputProps={{ min: 1 }}
                                helperText={t('Time limit for answering this question')}
                            />
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setAddQuestionDialogOpen(false)}
                        disabled={addQuestionMutation.isLoading}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddQuestion}
                        disabled={!selectedQuestionId || addQuestionMutation.isLoading}
                    >
                        {addQuestionMutation.isLoading ? <CircularProgress size={20} /> : t('Add Question')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Loading Overlay */}
            {(addQuestionMutation.isLoading || removeQuestionMutation.isLoading) && (
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
        </div>
    );
};

export default InventoryTestQuestions;