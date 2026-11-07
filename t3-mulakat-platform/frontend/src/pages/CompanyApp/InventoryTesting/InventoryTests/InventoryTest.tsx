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
    Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add, Edit, Delete, ToggleOn, ToggleOff, Visibility, Assignment } from '@mui/icons-material';
import { Edit02Icon, Delete01Icon, Add01Icon, DeliveryView01Icon, } from 'hugeicons-react';
import {
    useGetAllPersonalityTestsQuery,
    useDeletePersonalityTestMutation,
    useTogglePersonalityTestStatusMutation
} from 'src/hooks/useServices/usePersonalityTestServices';
import { array } from 'src/utils';
import { CustomButton, ConfirmAction } from 'src/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PersonalityTestCreateDialog from './components/PersonalityTestCreateDialog';
import { useNavigate, useParams } from 'react-router';

interface PersonalityTest {
    _id: string;
    testCode: string;
    name: {
        tr: string;
        en: string;
    };
    description: {
        tr: string;
        en: string;
    };
    instructions: {
        tr: string;
        en: string;
    };
    timeLimit: number | null;
    timeLimitEnabled: boolean;
    collectDemographics: boolean;
    demographicFields: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const InventoryTest = () => {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const currentLang = i18n.language as 'tr' | 'en';

    const [filters, setFilters] = useState({
        isActive: undefined as boolean | undefined,
        timeLimitEnabled: undefined as boolean | undefined,
        collectDemographics: undefined as boolean | undefined
    });

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<PersonalityTest | null>(null);
    const navigate = useNavigate()
    const { companySlug } = useParams();

    // Build query string
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.isActive !== undefined) {
            params.append('isActive', filters.isActive.toString());
        }
        if (filters.timeLimitEnabled !== undefined) {
            params.append('timeLimitEnabled', filters.timeLimitEnabled.toString());
        }
        if (filters.collectDemographics !== undefined) {
            params.append('collectDemographics', filters.collectDemographics.toString());
        }
        return params.toString();
    }, [filters]);

    // Queries and mutations
    const testsQuery = useGetAllPersonalityTestsQuery(queryString);
    const deleteMutation = useDeletePersonalityTestMutation();
    const toggleStatusMutation = useTogglePersonalityTestStatusMutation();

    const testsData = array<PersonalityTest>(testsQuery.data);

    // Handlers
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({ id });
            queryClient.invalidateQueries(['personalityTests']);
            toast.success(t('Personality test deleted successfully'));
        } catch (error: any) {
            toast.error(error?.response?.data?.error || t('Failed to delete personality test'));
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleStatusMutation.mutateAsync({ id });
            queryClient.invalidateQueries(['personalityTests']);
            toast.success(t('Test status updated'));
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

    if (testsQuery.isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (testsQuery.isError) {
        return (
            <Alert severity="error">
                {t('Error loading personality tests')}
            </Alert>
        );
    }

    return (
        <div className="flex flex-col space-y-6 pr-[55px]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="text-2xl font-semibold text-gray-900">
                        {t('Personality Tests')}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-1">
                        {t('Manage personality inventory tests and assessments')}
                    </Typography>
                </div>
                <div className='flex gap-1'>

                    <CustomButton
                        startIcon={<Add01Icon size={20} />}
                        className="bg-primary-600 hover:bg-primary-700"
                        variant='contained'
                        onClick={() => {
                            navigate(`/${companySlug}/inventory-testing/inventory-testquestions`)
                        }}
                    >
                        Inventory Test Questions
                    </CustomButton>
                    <CustomButton
                        startIcon={<Add01Icon size={20} />}
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        {t('Create Test')}
                    </CustomButton>
                </div>

            </div>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                {testsData.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('Total Tests')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                {testsData.filter(test => test.isActive).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('Active Tests')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                {testsData.filter(test => test.timeLimitEnabled).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('Timed Tests')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                {testsData.filter(test => test.collectDemographics).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('Demographic Tests')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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

                    {/* Feature Filters */}
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    <Chip
                        label={t('Timed')}
                        variant={filters.timeLimitEnabled === true ? 'filled' : 'outlined'}
                        onClick={() => handleFilterChange('timeLimitEnabled', filters.timeLimitEnabled === true ? undefined : true)}
                        className="cursor-pointer"
                        color="warning"
                    />
                    <Chip
                        label={t('Demographics')}
                        variant={filters.collectDemographics === true ? 'filled' : 'outlined'}
                        onClick={() => handleFilterChange('collectDemographics', filters.collectDemographics === true ? undefined : true)}
                        className="cursor-pointer"
                        color="info"
                    />
                </div>
            </div>

            {/* Table */}
            {testsData.length === 0 ? (
                <Alert severity="info">
                    {t('No personality tests found')}
                </Alert>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHead className="bg-gray-50">
                            <TableRow>
                                <TableCell className="font-semibold text-gray-900">
                                    {t('Test Name')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900">
                                    {t('Test Code')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900" align="center">
                                    {t('Time Limit')}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900" align="center">
                                    {t('Demographics')}
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
                            {testsData.map((test) => (
                                <TableRow
                                    key={test._id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell>
                                        <div className="max-w-sm">
                                            <Typography variant="body2" className="font-medium text-gray-900">
                                                {test.name[currentLang] || test.name.tr}
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-500 block truncate">
                                                {test.description[currentLang] || test.description.tr}
                                            </Typography>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" className="font-mono text-blue-600">
                                            {test.testCode}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {test.timeLimitEnabled && test.timeLimit ? (
                                            <Chip
                                                label={`${test.timeLimit}m`}
                                                color="warning"
                                                size="small"
                                                variant="outlined"
                                            />
                                        ) : (
                                            <Typography variant="body2" className="text-gray-400">
                                                {t('No limit')}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={test.collectDemographics ? t('Enabled') : t('Disabled')}
                                            color={test.collectDemographics ? 'success' : 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={test.isActive ? t('Active') : t('Inactive')}
                                            color={test.isActive ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* <Tooltip title={t('View Details')}>
                                                <IconButton
                                                    size="small"
                                                    className="text-gray-600 hover:text-green-600"
                                                >
                                                    <DeliveryView01Icon size={18} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={t('Test Results')}>
                                                <IconButton
                                                    size="small"
                                                    className="text-gray-600 hover:text-purple-600"
                                                >
                                                    <Assignment />
                                                </IconButton>
                                            </Tooltip> */}

                                            <Tooltip title={t('Edit')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingTest(test);
                                                        setCreateDialogOpen(true);
                                                    }}
                                                    className="text-gray-600 hover:text-blue-600"
                                                >
                                                    <Edit02Icon size={18} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={test.isActive ? t('Deactivate') : t('Activate')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleStatus(test._id)}
                                                    disabled={toggleStatusMutation.isLoading}
                                                    className={test.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-green-600'}
                                                >
                                                    {test.isActive ? <ToggleOn /> : <ToggleOff />}
                                                </IconButton>
                                            </Tooltip>

                                            <ConfirmAction
                                                title={t('Confirm Deletion')}
                                                description={t('Are you sure you want to delete this personality test? This action cannot be undone and will affect all related data.')}
                                                onConfirm={() => handleDelete(test._id)}
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
            <PersonalityTestCreateDialog
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                    setEditingTest(null);
                }}
                mode={editingTest ? 'edit' : 'create'}
                initialValues={editingTest ? {
                    testCode: editingTest.testCode,
                    name: editingTest.name,
                    description: editingTest.description,
                    instructions: editingTest.instructions,
                    timeLimit: editingTest.timeLimit,
                    timeLimitEnabled: editingTest.timeLimitEnabled,
                    collectDemographics: editingTest.collectDemographics,
                    demographicFields: editingTest.demographicFields,
                    isActive: editingTest.isActive
                } : undefined}
                testId={editingTest?._id}
                onSuccess={() => {
                    setCreateDialogOpen(false);
                    setEditingTest(null);
                }}
            />
        </div>
    );
};

export default InventoryTest;