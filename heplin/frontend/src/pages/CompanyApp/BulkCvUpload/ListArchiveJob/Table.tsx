import React from 'react';
import type { ChangeEvent, FC, MouseEvent } from 'react';
import { format } from 'date-fns';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { JobPost } from 'src/types/jobPost/jobPost';
import { TableHead } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Briefcase06Icon } from 'hugeicons-react';
import { tr, enGB } from 'date-fns/locale';

// const statusMap: any = {
//   completed: 'success',
//   active: 'info',
//   draft: 'info',
//   archived: 'info',
//   closed: 'warning',
// };

const locationTypeColorMap: any = {
  onsite: "#FD5FB2",
  hybrid: "#F3A815",
  remote: "#0FB900",
};


interface JobPostListTableProps {
  count?: number;
  items?: JobPost[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (jobId: string) => void;
  page?: number;
  rowsPerPage?: number;
}

export const ArchiveJobPostListTable: FC<JobPostListTableProps> = (props) => {
  const { t, i18n } = useTranslation();
  const dynamicLanguage = i18n.language;
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    onSelect,
    page = 0,
    rowsPerPage = 0,
  } = props;

  return (
    <div>
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
            <TableCell width={350}>{t('jobPost')}</TableCell>

            <TableCell align='center' width={180}>{t('jobType')}</TableCell>
            <TableCell align='center' width={180}>{t('workModel')}</TableCell>
            <TableCell width={180}>{t('location')}</TableCell>
            <TableCell align='center' width={180} >{t('applicationNumber')}</TableCell>
            <TableCell align='center' width={180}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((job) => {
            return (
              <TableRow
                hover
                key={job._id}
                onClick={() => onSelect?.(job._id)}
                sx={{
                  "& .MuiTableCell-root": {
                    fontSize: "14px",
                    fontWeight: "500",
                    fontFamily: "Satoshi, sans-serif",
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }
                }}
              >
                <TableCell>
                  <div className='flex gap-4'>
                    <Briefcase06Icon size={18} color='#E31E24' />
                    <p className='font-medium truncate' style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {job?.title}
                    </p>
                  </div>
                </TableCell>

                <TableCell align='center' sx={{ color: "#979797" }}>
                  {t(job?.jobType)}
                </TableCell>
                <TableCell align='center' sx={{ color: locationTypeColorMap[job?.locationType] }}>
                  {t(job?.locationType)}
                </TableCell>
                <TableCell sx={{ color: "#979797" }}>
                  {
                    [job.country?.names?.[dynamicLanguage], job.city, job.disctrict]
                      .filter(Boolean)
                      .map(i => i?.[0]?.toUpperCase() + i?.slice(1)?.toLowerCase())
                      .join(' · ')
                  }
                </TableCell>

                <TableCell align='center' >
                  {job?.applicationNumber}
                </TableCell>
                <TableCell align='center'>
                  <p className='text-[#E31E24] hover:underline'>
                    {t('details')}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
