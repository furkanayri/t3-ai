import { Box } from '@mui/material';
import {
  ApplicantQuestions,
  ApplicantSkills,
  Description,
  FormDefinitions,
  GeneralInfo,

} from './sections/JobOverview';
import { useDetailJob } from './DetailJobProvider';

export function Component() {
  const { jobState } = useDetailJob();
  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: '100vh', py: 3 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GeneralInfo />
          <Description />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <FormDefinitions />
          <ApplicantQuestions />
        </div>
      </div>
    </Box>
  );
}

Component.displayName = 'JobOverview';
