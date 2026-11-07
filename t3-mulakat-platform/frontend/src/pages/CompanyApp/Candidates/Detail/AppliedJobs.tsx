import { MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Chip,
  IconButton,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { my_applications } from 'src/fakedata/my_applications';

const appliedJobs = my_applications.slice(0, 2);

export default function AppliedJobs() {
  const { t } = useTranslation();
  return (
    <>
      <Stack
        spacing={3}
        sx={{ mt: 2, mx: 1 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t('appliedDate')}</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          {appliedJobs.map((job) => {
            return (
              <TableRow key={job._id}>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Avatar src={job.company.logo}></Avatar>
                    <div>
                      <Typography variant="subtitle1">{job.title}</Typography>
                      <Typography
                        variant="subtitle2"
                        color={'text.secondary'}
                      >
                        {job.company.name}
                      </Typography>
                    </div>
                  </Stack>
                </TableCell>
                <TableCell width={125}>{new Date(job.appliedDate).toLocaleDateString()}</TableCell>
                <TableCell width={100}>
                  <Chip
                    size="small"
                    label={job.appliedStatus}
                  ></Chip>
                </TableCell>

                <TableCell width={80}>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </Stack>
    </>
  );
}
