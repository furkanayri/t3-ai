import {
  Avatar,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { intlFormatDistance, isValid, format } from 'date-fns';
import { AuthorizedIcon, PencilEdit02Icon, ViewIcon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/hooks/use-router';
import { useGetAllEducationsOfTenantQuery } from 'src/hooks/useServices';

export default function CandidatesListTable({
  items,
  jobList,
  openCandidatePanel,
}: {
  items: any[];
  jobList: any[]
  openCandidatePanel: (candidateId: string) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className='py-[22px] rounded-[13px] mt-[20px]'
      style={{
        boxShadow: "0px 4px 14.8px 0px #A6A6A640"
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                fontSize: "14px",
                fontWeight: "500",
                fontFamily: "Satoshi, sans-serif",
                textTransform: "capitalize",
              }
            }}
          >
            <TableCell>{t('candidate')}</TableCell>
            <TableCell align='center'>{t('createdDate')}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items?.map((candidate: any) => {
            const user = candidate?.candidateUser;

            return (
              <TableRow
                key={candidate._id}
                sx={{
                  ":hover": {
                    backgroundColor: "rgba(0,0,0,0.04)",
                  },
                  cursor: 'pointer',
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'all 200ms',
                }}
              >
                <TableCell>
                  <div
                    onClick={() => openCandidatePanel(candidate._id)}
                    className="flex items-center gap-x-2 cursor-pointer group"
                  >
                    <Avatar src={user?.avatar ?? ''}>{user?.name[0].toUpperCase() + user?.surname[0].toUpperCase()}</Avatar>
                    <Typography
                      sx={{ cursor: 'pointer' }}
                      variant="subtitle1"
                      className='group-hover:underline'
                    >
                      {user?.name + ' ' + user?.surname}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Tooltip
                    title={
                      isValid(new Date(candidate?.createdAt))
                        ? format(new Date(candidate?.createdAt), 'yyyy.MM.dd kk:mm')
                        : null
                    }
                  >
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      variant="body2"
                      className="capitalize"
                    >
                      {isValid(new Date(candidate?.createdAt))
                        ? intlFormatDistance(
                          new Date(candidate?.createdAt),
                          new Date(),
                          {
                            numeric: 'always',
                          }
                        )
                        : null}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell >
                  <div className='flex items-center gap-2'>
                    <Tooltip title={t('edit')}>
                      <IconButton onClick={() => router.push(`/candidates/${candidate?.userId}/edit`)}>
                        <AuthorizedIcon size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('details')}>
                      <IconButton onClick={() => openCandidatePanel(candidate._id)}>
                        <ViewIcon size={18} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div >
  );
}
