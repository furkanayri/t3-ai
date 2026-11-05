import {
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function CandidatesListTable({
  items,
  openCandidatePanel,
  searchName,
  searchSurname,
}: {
  items: any;
  openCandidatePanel: (candidateId: string) => void;
  searchName: string;
  searchSurname: string;
}) {
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('name'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#000',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'surname',
      headerName: t('surname'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#000',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: t('email'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#000',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'interviewNamesStr',
      headerName: t('interviews'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value || params.value === '-') {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          );
        }

        const interviews = params.value.split(',').map((s: string) => s.trim()).filter(Boolean);

        if (interviews.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          );
        }

        if (interviews.length === 1) {
          return (
            <Chip
              label={interviews[0]}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          );
        }

        // Birden fazla mülakat varsa
        return (
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <Chip
              label={interviews[0]}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
            <Chip
              label={`+${interviews.length - 1}`}
              size="small"
              color="primary"
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              title={interviews.slice(1).join(', ')}
            />
          </Stack>
        );
      },
    },
  ];

  const filteredRows = useMemo(() => {
    return (items?.results || []).filter((row: any) => {
      const nameMatch = !searchName || row.name?.toLowerCase().includes(searchName.toLowerCase());
      const surnameMatch = !searchSurname || row.surname?.toLowerCase().includes(searchSurname.toLowerCase());
      return nameMatch && surnameMatch;
    });
  }, [items?.results, searchName, searchSurname]);

  return (
    <div
      className="py-[22px] rounded-[13px] mt-[20px]"
      style={{
        boxShadow: '0px 4px 14.8px 0px #A6A6A640',
        height: 600,
      }}
    >
      <DataGrid
        rows={filteredRows}
        columns={columns}
        getRowId={(row) => row._id}
        onRowClick={(params) => openCandidatePanel(params.row._id)}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50, 100]}
        paginationMode="client"
        initialState={{
          pagination: {
            paginationModel: { pageSize: 50 },
          },
        }}
        localeText={{
          MuiTablePagination: {
            labelRowsPerPage: 'Sayfa başına satır:',
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'capitalize',
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
        }}
      />
    </div>
  );
}