import {
    Alert,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Tab,
    Tabs,
} from '@mui/material';
import { useState, useMemo, SetStateAction, useCallback, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import {
    useGetAllCategoriesQuery,
    usePostNewCategoriesMutation,
    useDeleteCategoriesMutation,
    useUpdateCategoriesMutation,
} from 'src/hooks/useServices';
import { t } from 'i18next';
import { CustomButton, Paginate } from 'src/components/shared';
import { Delete02Icon, NewJobIcon, Add01Icon, AddCircleIcon, UnavailableIcon, Edit02Icon } from 'hugeicons-react';
import { useAuth } from 'src/providers';

type CategoryStatus = 'active' | 'pending';

const tabs = [
    { label: 'Active', value: 'active' },
    { label: 'pendingCategories', value: 'pending' },
];

export function Component() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const { activeTenantId } = useAuth()
    const navigate = useNavigate()
    const activeTab = useMemo(() => searchParams.get('activeTab') || 'active', [searchParams])

    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const pageSizes = [9, 12, 20];

    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0;
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0];
    const query = useMemo(() => `page=${page + 1}&limit=${limit}&status=${activeTab}`, [page, limit, activeTab]);
    const categoriesQuery = useGetAllCategoriesQuery(query);

    const categories = categoriesQuery.data?.results || [];
    const postCategory = usePostNewCategoriesMutation();
    const deleteCategory = useDeleteCategoriesMutation();
    const updateCategory = useUpdateCategoriesMutation();


    const handleOpen = () => {
        setOpen(true);
        setName('');
        setDescription('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEditOpen = (category: { name: SetStateAction<string>; description: SetStateAction<string>; }) => {
        setSelectedCategory(category);
        setName(category?.name);
        setDescription(category.description);
        setEditOpen(true);
    };

    const handleEditClose = () => {
        setEditOpen(false);
    };

    const handleSave = async () => {
        await postCategory.mutateAsync(
            {
                payload: {
                    name,
                    description,
                    tenantId: activeTenantId ?? '',
                    status: 'active'
                },
                adminTenantId: activeTenantId ?? '',
            },
            {
                onSuccess: () => {
                    categoriesQuery.refetch();
                    enqueueSnackbar('Category added successfully', { variant: 'success' });
                    handleClose();
                },
                onError: (error: unknown) => {
                    const errorMessage = (error as { message: string }).message;
                    return enqueueSnackbar(errorMessage, { variant: 'error' });
                },
            }
        );
    };

    const handleEditSave = async () => {
        await updateCategory.mutateAsync(
            { adminTenantId: activeTenantId ?? '', id: selectedCategory._id, payload: { name, description } },
            {
                onSuccess: () => {
                    categoriesQuery.refetch();
                    enqueueSnackbar('Category updated successfully', { variant: 'success' });
                    handleEditClose();
                },
                onError: (error: unknown) => {
                    const errorMessage = (error as { message: string }).message;
                    return enqueueSnackbar(errorMessage, { variant: 'error' });
                },
            }
        );
    };

    const handleDelete = async (id: any) => {
        await deleteCategory.mutateAsync(
            { id, adminTenantId: activeTenantId ?? '' },
            {
                onSuccess: () => {
                    categoriesQuery.refetch();
                    enqueueSnackbar('Category deleted successfully', { variant: 'success' });
                },
                onError: (error: unknown) => {
                    const errorMessage = (error as { message: string }).message;
                    return enqueueSnackbar(errorMessage, { variant: 'error' });
                },
            }
        );
    };

    const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
        setSearchParams(prev => {
            prev.set('activeTab', value)
            return prev
        })
    }, []);

    const handleStatusChange = async (categoryId: string, newStatus: CategoryStatus) => {
        await updateCategory.mutateAsync(
            { adminTenantId: activeTenantId ?? '', id: categoryId, payload: { status: newStatus } },
            {
                onSuccess: () => {
                    categoriesQuery.refetch();
                    enqueueSnackbar('Category status updated successfully', { variant: 'success' });
                },
                onError: (error: unknown) => {
                    const errorMessage = (error as { message: string }).message;
                    return enqueueSnackbar(errorMessage, { variant: 'error' });
                },
            }
        );
    };

    return (
        <>
            <div className='pr-[55px] w-full overflow-x-scroll'>
                <div className='flex justify-between mb-[30px]'>
                    <p className='text-2xl font-medium'>{t('categories')}</p>
                    <CustomButton
                        startIcon={<Add01Icon size={18} />}
                        onClick={handleOpen}
                    >
                        {t('createNewCategory')}
                    </CustomButton>
                </div>
                <Tabs
                    onChange={handleTabsChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    value={activeTab}
                    sx={{
                        "& .Mui-selected": { color: "#E31E24!important" },
                        "& .MuiTabs-indicator": { backgroundColor: "#E31E24" },
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={t(tab.label)}
                            value={tab.value}
                            sx={{ color: "#141B34" }}
                        />
                    ))}
                </Tabs>
                <div
                    className='mt-[20px]'
                    style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
                >
                    {
                        categoriesQuery.isError ? (
                            <Alert severity="error">{(categoriesQuery?.error as any)?.message}</Alert>
                        ) : !categoriesQuery.isLoading && categories.length === 0 ? (
                            <Alert severity="info">{t('noCategories')}</Alert>
                        ) : (
                            <Paginate
                                isFetching={categoriesQuery.isFetching || categoriesQuery.isPreviousData}
                                pageSizes={pageSizes}
                                count={categoriesQuery?.data?.count}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('categoryName')}</TableCell>
                                            <TableCell>{t('categoryDescription')}</TableCell>
                                            <TableCell>{t('createdBy')}</TableCell>
                                            <TableCell align='center'>{t('actions')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categories.map((category: { _id?: any; name: any; description: any; status: CategoryStatus, tenantId: any }) => (
                                            <TableRow key={category._id}>
                                                <TableCell>{category?.name}</TableCell>
                                                <TableCell sx={{ maxWidth: 500 }}>{category?.description || '-'}</TableCell>
                                                <TableCell>{category.tenantId?.name}</TableCell>
                                                <TableCell align='center'>
                                                    <Tooltip title={t("edit")}>
                                                        <IconButton onClick={() => handleEditOpen(category)}>
                                                            <Edit02Icon size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {category.status === 'pending' &&
                                                        <Tooltip title={t("markAsActive")}>
                                                            <IconButton onClick={() => handleStatusChange(category._id, 'active')}>
                                                                <AddCircleIcon size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                    <Tooltip title={t("delete")}>
                                                        <IconButton onClick={() => handleDelete(category._id)}>
                                                            <Delete02Icon size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {category.status === 'active' &&
                                                        <Tooltip title={t("jobs")}>
                                                            <IconButton
                                                                onClick={() => navigate(`/categories/${category._id}/jobs`)}
                                                            >
                                                                <NewJobIcon size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paginate>
                        )
                    }
                </div>
            </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{t('addNewCaterory')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('categoryName')}
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label={t('categoryDescription')}
                        type="text"
                        multiline
                        minRows={3}
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('Cancel')}</Button>
                    <Button onClick={handleSave}>{t('Save')}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editOpen} onClose={handleEditClose}>
                <DialogTitle>{t("editCategory")}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('categoryName')}
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label={t('categoryDescription')}
                        type="text"
                        multiline
                        minRows={3}
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>{t('Cancel')}</Button>
                    <Button onClick={handleEditSave}>{t('Save')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

Component.displayName = 'CategoriesList';