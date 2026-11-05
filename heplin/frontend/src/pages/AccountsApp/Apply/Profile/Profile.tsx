import { Box, CircularProgress } from '@mui/material';
import {
  useGetAllCandidateEducationsQuery,
  useGetAllCandidateExperiencesQuery,
  useGetAllCandidateCertificatesQuery,
  useGetAllCandidateLanguagesQuery,

} from 'src/hooks/useServices';

import { array } from 'src/utils';
import Experiences from './Experiences';
import Educations from './Educations';
import Certificates from './Certificates';
import CVSelect from './CVSelect';
import CoverLetter from './CoverLetter';
import Languages from './Languages';

export default function Profile({
  selectedCV,
  onSelectCV,
  coverLetter,
  onChangeCoverLetter,
}: {
  selectedCV: null | string;
  onSelectCV: (cv: string) => void;
  coverLetter?: string;
  onChangeCoverLetter: (val: string) => void;
}) {
  const experiencesQuery = useGetAllCandidateExperiencesQuery({ refetchOnWindowFocus: true });
  const educationsQuery = useGetAllCandidateEducationsQuery({ refetchOnWindowFocus: true });
  const certificatesQuery = useGetAllCandidateCertificatesQuery({ refetchOnWindowFocus: true });
  const languagesQuery = useGetAllCandidateLanguagesQuery({ refetchOnWindowFocus: true });

  const experiences = array<any>(experiencesQuery?.data?.results);

  const educations = array<any>(educationsQuery?.data?.results);
  const certificates = array<any>(certificatesQuery?.data?.results);

  if (educationsQuery.isLoading || experiencesQuery.isLoading || certificatesQuery.isLoading)
    return <CircularProgress />;
  const languages = array<any>(languagesQuery?.data?.results);
  if (educationsQuery.isLoading || experiencesQuery.isLoading) return <CircularProgress />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CoverLetter
        coverLetter={coverLetter}
        onChangeCoverLetter={onChangeCoverLetter}
      />
      <CVSelect
        selectedCV={selectedCV}
        onSelectCV={(cv: string) => onSelectCV(cv)}
      />
      <Educations data={educations} />
      <Experiences data={experiences} />
      <Certificates data={certificates} />
      <Languages data={languages} />


    </Box >
  );
}
