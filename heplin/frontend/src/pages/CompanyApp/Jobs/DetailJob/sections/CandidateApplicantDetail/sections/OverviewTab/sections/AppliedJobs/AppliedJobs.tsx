import {
  CircularProgress,
  Typography,
} from '@mui/material';
import { useCandidateDetail } from '../../../../CandidateApplicantDetail';
import { useTranslation } from 'react-i18next';
import { useGetMyEmployeeDataQuery } from 'src/hooks/useServices';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AppliedJobAccordion from './component/AppliedJobAccordion';

export default function AppliedJobs() {
  const [searchParams, setSearchParams] = useSearchParams()

  const { t } = useTranslation();
  const { candidateState } = useCandidateDetail();
  const employeeDataQuery = useGetMyEmployeeDataQuery();
  const { id } = useParams()

  const employee = employeeDataQuery?.data?.employee;
  const appliedJobs = candidateState?.data?.appliedJobs;

  const handleChange = (panelId: any) => (event: any, isExpanded: any) => {
    setSearchParams((prev) => {
      if (!isExpanded) {
        prev.delete('comment');
      } else {
        prev.set('comment', 'true');
      }
      return prev;
    });
  };
  const filteredJobs = useMemo(() => {
    return {
      applied: appliedJobs?.filter((job) => id === job.jobId?._id) || [],
      other: appliedJobs?.filter((job) => id !== job.jobId?._id) || [],
    };
  }, [appliedJobs, id]);
  if (candidateState.isLoading)
    return (
      <div className="mx-4 my-4">
        <CircularProgress />
      </div>
    );

  return (
    <div className="space-y-2 mx-4 my-4">
      <div className="mb-4">
        <Typography variant="subtitle1">{t('appliedJobs')}</Typography>
      </div>
      <AppliedJobAccordion 
      defaultExpanded={true}
      appliedJobs={filteredJobs?.applied}
       handleChange={handleChange}
        employee={employee} />
      {filteredJobs?.other?.length > 0 && (
        <>
          <div className="mb-4">
            <Typography variant="subtitle1">{t('other')}</Typography>
          </div>
          <AppliedJobAccordion
          defaultExpanded={false}
            appliedJobs={filteredJobs.other}
            handleChange={handleChange}
            employee={employee}
          />
        </>
      )}
    </div>
  );
}



