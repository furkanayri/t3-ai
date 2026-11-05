import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useUpdateEmployeeMutation } from 'src/hooks/useServices';
import { enqueueSnackbar } from 'notistack';
import { t } from 'i18next';

type EmployeePermissionDialogProps = {
  handleClose: () => void;
  open: boolean;
  data: any;
  employeesQueryRefecth: any;
};

function EmployeePermissonDialog({
  handleClose,
  open,
  data,
  employeesQueryRefecth,
}: EmployeePermissionDialogProps) {
  const [selectedPermission, setSelectedPermission] = useState<string>('');

  const employeeMutation = useUpdateEmployeeMutation();

  useEffect(() => {
    if (data?.type) {
      setSelectedPermission(data.type);
    }
  }, [data]);

  const handleSumbit = () => {
    employeeMutation.mutate(
      {
        id: data?._id,
        payload: {
          type: selectedPermission,
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar(t('employeeUpdated'), { variant: 'success' });
          handleClose();
          employeesQueryRefecth();
        },
        onError: () => {
          enqueueSnackbar(t("emplyeeUpdateFailed"), { variant: 'error' });
        },
      }
    );
  };

  return (
    <Dialog open={open}>
      <div className="p-4 h-[340px] ">
        <DialogTitle style={{ textAlign: 'center' }}>{t('employeePermissions')}</DialogTitle>
        <DialogContent
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {t('employee')} {data?.name} {data?.surname}{' '}
          </div>

          <div
            className="mt-6"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              value={selectedPermission}
              onChange={(event, value: any) => setSelectedPermission(value)}
              options={['employee', 'owner', 'manager', 'staff']}
              getOptionLabel={(option) => t(option)}
              sx={{ width: 200 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('permissions')}
                />
              )}
            />
          </div>

          <div
            className="mt-20"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <DialogActions>
              <Button
                variant="outlined"
                onClick={handleClose}
              >
                {t('close')}
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSumbit()}
              >
                {t('save')}
              </Button>
            </DialogActions>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}

export default EmployeePermissonDialog;
