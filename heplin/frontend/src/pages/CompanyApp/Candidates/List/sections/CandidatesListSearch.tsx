import React, { useState, FormEvent } from 'react';
import { Autocomplete, Box, Button, IconButton, Stack, TextField } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '../../../../../components/shared';
import CustomOutlinedInput from './CustomOutlinedInput';
import { useGetAllJobsQuery } from 'src/hooks/useServices';
import DescriptionIcon from '@mui/icons-material/Description';
import { getAllCandidatesExcelService } from 'src/services';

export default function CandidatesListSearch({ refetch }: { refetch: () => void }) {
  const jobsQuery = useGetAllJobsQuery("status=published");
  const jobs = jobsQuery.data?.results || [];
  const [searchParams, setSearchParams] = useSearchParams();

  const [fullName, setFullName] = useState<string>(searchParams.get('fullName') || '');
  const [jobTitle, setJobTitle] = useState<any>(searchParams.get('jobTitle') || '');

  const { t } = useTranslation();

  const handleQueryChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams((prev) => {
      prev.set('fullName', fullName);
      prev.set('jobTitle', jobTitle?.title || '');
      prev.set('page', '0');
      return prev;
    });
    refetch();
  };

  const handleExcelExport = async () => {
    try {
      const queryString = new URLSearchParams({
        page: String(1),
        limit: String(-1),
        fullName,
        jobTitle: jobTitle?.title || '',
        format: 'excel',
      }).toString();

      const blob = await getAllCandidatesExcelService(queryString);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidates.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel indirilemedi', err);
    }
  };



  return (
    <Box component="form" onSubmit={handleQueryChange} sx={{ flexGrow: 1, mb: 3 }}>
      <Stack direction="row" alignItems='center' spacing={2}>
        <div className='w-[300px]'>
          <CustomOutlinedInput
            value={fullName}
            onChange={(value: string) => setFullName(value)}
            name="fullName"
            placeholder={t("searchUsers")}
            height='50px'
          />
        </div>
        <div className='w-[300px]'>
          <Autocomplete
            disablePortal
            options={jobs}
            value={jobTitle || null}
            onChange={(event, value) => setJobTitle(value)}
            isOptionEqualToValue={(option, value) => option.title === value.title}
            getOptionLabel={(option) => option.title || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                hiddenLabel
                placeholder={t("selectJob")}

              />
            )}
          />
        </div>

        <CustomButton type="submit" sx={{ height: '40px', minWidth: '138px', py: '10px' }}>
          {t('filter')}
        </CustomButton>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DescriptionIcon />}
            onClick={handleExcelExport}
            sx={{
              textTransform: 'none',
              px: 2,
            }}
          >
            {t('exportExcel')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}