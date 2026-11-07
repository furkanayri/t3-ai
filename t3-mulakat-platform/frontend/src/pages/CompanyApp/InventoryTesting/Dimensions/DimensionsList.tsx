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
import { useGetAllDimensionsQuery, useDeleteDimensionMutation, useToggleDimensionStatusMutation } from 'src/hooks/useServices/useDimensionServices';
import { array } from 'src/utils';
import { CustomButton, ConfirmAction } from 'src/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast'
import DimensionCreateDialog from './components/DimentsionCreateDialog';
import { useNavigate, useParams } from 'react-router';

interface Dimension {
  _id: string;
  dimensionCode: string;
  name: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
  parentDimensionId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DimensionsList = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLang = i18n.language as 'tr' | 'en';
  const { companySlug } = useParams();

  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    parentDimensionId: undefined as string | undefined
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(null);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters.parentDimensionId) {
      params.append('parentDimensionId', filters.parentDimensionId);
    }
    return params.toString();
  }, [filters]);

  // Queries and mutations
  const dimensionsQuery = useGetAllDimensionsQuery(queryString);
  const deleteMutation = useDeleteDimensionMutation();
  const toggleStatusMutation = useToggleDimensionStatusMutation();

  const dimensionsData = array<Dimension>(dimensionsQuery.data);
  const navigate = useNavigate()
  // Handlers
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries(['dimensions']);
      toast.success(t('Dimension başarıyla silindi'));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('Dimension silinemedi'));
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync({ id });
      queryClient.invalidateQueries(['dimensions']);
      toast.success(t('Dimension durumu güncellendi'));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('Durum güncellenemedi'));
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (dimensionsQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (dimensionsQuery.isError) {
    return (
      <Alert severity="error">
        {t('Dimensionlar yüklenirken bir hata oluştu')}
      </Alert>
    );
  }

  return (
    <div className="flex flex-col space-y-6  pr-[55px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="text-2xl font-semibold text-gray-900">
            {t('Dimensions')}
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {t('Manage personality inventory dimensions')}
          </Typography>
        </div>
        <div className="flex gap-3">
          <CustomButton
            startIcon={<Edit02Icon size={20} />}
            onClick={() => {
              navigate(`/${companySlug}/inventory-testing/inventory-testing-questions`)
            }}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {t('Manage Questions')}
          </CustomButton>
          <CustomButton
            startIcon={<Add01Icon size={20} />}
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {t('Add Dimension')}
          </CustomButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Table */}
      {dimensionsData.length === 0 ? (
        <Alert severity="info">
          {t('No dimensions found')}
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold text-gray-900">
                  {t('Dimension Code')}
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {t('Name')}
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {t('Description')}
                </TableCell>
                <TableCell className="font-semibold text-gray-900" align="center">
                  {t('Status')}
                </TableCell>
                <TableCell className="font-semibold text-gray-900" align="center">
                  {t('Parent')}
                </TableCell>
                <TableCell className="font-semibold text-gray-900" align="right">
                  {t('Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dimensionsData.map((dimension) => (
                <TableRow
                  key={dimension._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <Typography variant="body2" className="font-mono font-medium text-gray-900">
                      {dimension.dimensionCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-medium text-gray-900">
                      {dimension.name[currentLang] || dimension.name.tr}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      className="text-gray-600 max-w-xs truncate"
                      title={dimension.description[currentLang] || dimension.description.tr}
                    >
                      {dimension.description[currentLang] || dimension.description.tr}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={dimension.isActive ? t('Active') : t('Inactive')}
                      color={dimension.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {dimension.parentDimensionId ? (
                      <Chip
                        label={t('Sub-dimension')}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    ) : (
                      <Chip
                        label={t('Main dimension')}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip title={t('Edit')}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingDimension(dimension);
                            setCreateDialogOpen(true);
                          }}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <Edit02Icon size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={dimension.isActive ? t('Deactivate') : t('Activate')}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(dimension._id)}
                          disabled={toggleStatusMutation.isLoading}
                          className={dimension.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-green-600'}
                        >
                          {dimension.isActive ? <ToggleOn /> : <ToggleOff />}
                        </IconButton>
                      </Tooltip>

                      <ConfirmAction
                        title={t('Confirm Deletion')}
                        description={t('Are you sure you want to delete this dimension? This action cannot be undone.')}
                        onConfirm={() => handleDelete(dimension._id)}
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

      {/* Create Dialog */}
      <DimensionCreateDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingDimension(null);
        }}
        mode={editingDimension ? 'edit' : 'create'}
        initialValues={editingDimension ? {
          dimensionCode: editingDimension.dimensionCode,
          parentDimensionId: editingDimension.parentDimensionId || '',
          name: editingDimension.name,
          description: editingDimension.description,
          isActive: editingDimension.isActive
        } : undefined}
        dimensionId={editingDimension?._id}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setEditingDimension(null);
          // refetch handled inside dialog, but ensure list refresh
          // dimensionsQuery.refetch();
        }}
      />
    </div>
  );
};

export default DimensionsList;