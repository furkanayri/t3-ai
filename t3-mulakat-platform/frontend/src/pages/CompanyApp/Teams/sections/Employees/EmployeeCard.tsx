import { TableRow, TableCell, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks/use-dialog';
import { EmployeePermissonDialog } from './sections';
import { Settings02Icon } from 'hugeicons-react';
import { useAuth } from 'src/providers';

type PropTypes = {
  employee: any;
  employeesQueryRefecth: any
};

const EmployeeCard = ({ employee, employeesQueryRefecth }: PropTypes) => {
  const { t } = useTranslation();
  const { data, handleClose, handleOpen, open } = useDialog<any>();
  const { user } = useAuth()
  const isManagerOrOwner = user.employee?.type === 'manager' || user.employee?.type === 'owner';
  return (
    <>
      <EmployeePermissonDialog
        handleClose={handleClose}
        open={open}
        data={data}
        employeesQueryRefecth={employeesQueryRefecth}
      />
      <TableRow>
        <TableCell>
          {employee?.name || '-'} {employee?.surname || '-'}
        </TableCell>
        <TableCell>{employee?.email}</TableCell>
        <TableCell>
          <Tooltip title={t('settings')}>
            <IconButton
              disabled={!isManagerOrOwner}
              onClick={() => handleOpen(employee)}
              sx={{ '&:hover': { backgroundColor: '#fff' } }}
            >
              <Settings02Icon
                color={(!isManagerOrOwner) ? '#A6A6A6' : '#141B34'}
                size={18}
              />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </>
  );
};

export default EmployeeCard;
