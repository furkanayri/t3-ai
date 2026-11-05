import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { JobOverview, JobApplications } from './sections';
import { useParams, useSearchParams } from 'react-router-dom';
import { SyntheticEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobDetail } from './context';
import { useDeleteJobMutation } from 'src/hooks/useServices/admin';
import { useSnackbar } from 'notistack';
import { useDialog } from 'src/hooks/use-dialog';
import { useRouter } from 'src/hooks/use-router';

export function Component() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, handleClose, handleOpen, open } = useDialog<any>();

  const router = useRouter()
  const activeTab = useMemo(() => searchParams.get('activeTab') || 'overview', [searchParams]);
  const handleTabsChange = (event: SyntheticEvent<Element, Event>, value: any) => {
    setSearchParams((prev) => {
      prev.set('activeTab', value);
      return prev;
    });
  }
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams()
  let selecetedTenantId = useMemo(() => searchParams.get('tenantId'), [searchParams])

  const deletejobMutation = useDeleteJobMutation()
  const handleDeleteJob = () => {
    deletejobMutation.mutateAsync({
      jobId: id ?? '',
      tenantId: selecetedTenantId ?? '',
    }, {
      onSuccess(data, variables, context) {
        enqueueSnackbar('Deleted Succesfuly', {
          variant: 'success',
        });
        handleClose()
        router.push('/jobs')

      },
      onError(error, variables, context) {
        enqueueSnackbar('Deleted was an Error', {
          variant: 'error',
        });
      },
    })
  }
  const { isLoading } = useJobDetail()

  return (
    <Box>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle> {t('deleteJobPost')}</DialogTitle>
        <DialogContent>
          {t('Are you sure you want to delete this job post?')}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='contained'>{t('close')}</Button>
          <Button onClick={handleDeleteJob} variant='outlined' color='error'>{t('delete')}</Button>
        </DialogActions>
      </Dialog>
      <div className='flex items-center justify-between'>

        <Tabs
          value={activeTab}
          onChange={handleTabsChange}
          sx={{ marginBottom: 2 }}
        >
          {["overview", "applications"].map((item, ind) => {
            return (
              <Tab
                tabIndex={ind}
                label={t(item)}
                key={item}
                value={item}
              />
            )
          })}

        </Tabs>
        <div>
          <Button
            onClick={handleOpen}
            variant='outlined'
            color='error'>
            {t('delete')}

          </Button>
        </div>
      </div>
      {isLoading ? <div className='w-full m-16'><CircularProgress /></div>
        :
        <>
          {activeTab === 'overview' && <JobOverview />}
          {activeTab === 'applications' && <JobApplications />}
        </>
      }
    </Box>

  );
}

Component.displayName = 'JobDetailPage';
