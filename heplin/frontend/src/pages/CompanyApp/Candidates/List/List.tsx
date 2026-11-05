import { useMemo, useState } from 'react';
import { Alert, CircularProgress, TextField, InputAdornment, Box } from '@mui/material';
import { Search } from '@mui/icons-material';
import { CandidatesListSearch, CandidatesListTable, PageHeader } from './sections';
import { Seo } from 'src/components/seo';
import { useSearchParams } from 'react-router-dom';
import { useGetAllCandidatesQuery } from 'src/hooks/useServices';
import CandidateApplicantDetailDrawer from '../../Jobs/DetailJob/sections/CandidateApplicantDetail/CandidateApplicantDetail';
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchName, setSearchName] = useState('');
  const [searchSurname, setSearchSurname] = useState('');

  const pageSizes = [25, 35, 45, 60];
  const page = useMemo(() => Number(searchParams.get('page') || 0), [searchParams]);
  const limit = useMemo(() => Number(searchParams.get('limit') || 20000), [searchParams]);
  const excel = useMemo(() => searchParams.get('format') ?? '', [searchParams]);

  const query = useMemo(() => {
    let baseQuery = `page=1&limit=${limit}`;
    // Ad veya soyad araması için fullName parametresini kullan
    const searchTerm = searchName.trim() || searchSurname.trim();
    if (searchTerm) {
      baseQuery += `&fullName=${encodeURIComponent(searchTerm)}`;
    }
    return baseQuery;
  }, [limit, searchName, searchSurname]);



  const candidatesQuery = useGetAllCandidatesQuery(query);

  // API'den gelen veriyi frontend için dönüştür
  const candidates = useMemo(() => {
    if (!candidatesQuery.data) return null;

    return {
      count: candidatesQuery.data.count,
      results: candidatesQuery.data.results.map((candidate: any) => ({
        ...candidate,
        interviewNamesStr: candidate.interviewNames?.join(', ') || '-',
      })),
    };
  }, [candidatesQuery.data]);

  const openCandidateDetail = (candidateId: string) => {
    setSearchParams(prev => {
      prev.set('candidateId', candidateId);
      return prev;
    }
    );
  };

  if (candidatesQuery.isError)
    return <Alert severity="error">{(candidatesQuery?.error as any)?.message}</Alert>;

  return (
    <>
      <Seo title="JobPost: JobPost List" />
      <div className='pr-[55px]'>
        <CandidateApplicantDetailDrawer fromCandidatesList={true} />
        <PageHeader />
        {/* <CandidatesListSearch refetch={candidatesQuery.refetch} /> */}

        <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder={t('Search by name...')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            variant="outlined"
            size="small"
            placeholder={t('Search by surname...')}
            value={searchSurname}
            onChange={(e) => setSearchSurname(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>

        {candidatesQuery?.isLoading ? (
          <div style={{ position: 'relative', width: '100%', height: '600px' }}>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}
            >
              <CircularProgress size={60} />
            </div>
          </div>
        ) : candidates?.results.length === 0 ? (
          <Alert severity="warning">{t('noCandidatesFound')}</Alert>
        ) : (
          <CandidatesListTable
            items={candidates}
            openCandidatePanel={openCandidateDetail}
            searchName={searchName}
            searchSurname={searchSurname}
          />
        )}
      </div>
    </>
  );
}

Component.displayName = 'CandidatesList';
