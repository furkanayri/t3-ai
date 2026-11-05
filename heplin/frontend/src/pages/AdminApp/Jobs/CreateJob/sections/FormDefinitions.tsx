import {
  Button,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import type { JobForm } from 'src/types/jobPost';
import { ArrowDropDownOutlined } from '@mui/icons-material';
import { grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

type FieldOnChangeStatus = ({
  isRequired,
  isVisible,
}: {
  isRequired: boolean;
  isVisible: boolean;
}) => void;

function FieldStatus({
  isRequired,
  isVisible,
  onChange,
}: {
  isRequired: boolean;
  isVisible: boolean;
  onChange: FieldOnChangeStatus;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();

  const currentTypeStatus = !isVisible ? 'invisible' : isRequired ? 'required' : 'optional';

  const filteredStatus = ['required', 'optional', 'invisible'].filter(
    (item) => item !== currentTypeStatus
  );

  return (
    <>
      <Button
        size="small"
        color="inherit"
        sx={{
          fontWeight: 500,
          background: grey[200],
        }}
        endIcon={<ArrowDropDownOutlined />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {t(currentTypeStatus)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {filteredStatus.map((item, index) => (
          <MenuItem
            sx={{ fontSize: '14px', minWidth: '120px' }}
            key={item + index}
            onClick={() => {
              onChange({
                isRequired: item === 'required' ? true : false,
                isVisible: item === 'invisible' ? false : true,
              });
              setAnchorEl(null);
            }}
          >
            {t(item)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function FormDefinitions() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<JobForm>();

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography variant="h6">{t('formDefinitions')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('DefineDescription_viewsInCareersPage')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Table>
              <TableBody>
                {values.fields.map((field, fieldInd) => {
                  return (
                    <TableRow
                      key={field.type + fieldInd}
                      style={field.isVisible ? {} : { opacity: '.4' }}
                    >
                      <TableCell>
                        {t(field.type)} {field.isRequired ? '*' : ''}
                      </TableCell>
                      <TableCell align="right">
                        <FieldStatus
                          isRequired={field.isRequired}
                          isVisible={field.isVisible}
                          onChange={(payload) =>
                            setFieldValue(`fields[${fieldInd}]`, {
                              type: field.type,
                              isRequired: payload?.isRequired,
                              isVisible: payload?.isVisible,
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
