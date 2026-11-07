import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useGetArchiveJobDetailQuery } from 'src/hooks/useServices';

import ArchiveJobGeneralInfo from './JobOverview/ArchiveJobGeneralInfo';
import ArchiveJobDescription from './JobOverview/ArchiveJobDescription';


export function Component() {
  const { t, i18n } = useTranslation()
  const { id, companySlug } = useParams();
  const jobState = useGetArchiveJobDetailQuery({ id: id! });



  return (
    <Box sx={{ backgroundColor: "'neutral.100'" }}>
      <div className="flex items-start gap-x-4">
        <div className="flex-[2] space-y-4">
          <ArchiveJobGeneralInfo />
          <ArchiveJobDescription job={jobState?.data?.job} />

          {/* <Requirements /> */}
        </div>
      </div>
    </Box>
  );
}

Component.displayName = 'JobOverview';
