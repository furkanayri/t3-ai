import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetAllSkillsQuery } from 'src/hooks/useServices';
import type { JobForm } from 'src/types/jobPost';
import { array } from 'src/utils';
import debounce from 'lodash.debounce';
import { useMemo, useState } from 'react';

export default function SkillsForm() {
  const { t } = useTranslation();
  const { values, handleBlur, setFieldValue, errors, touched } = useFormikContext<JobForm>();
  const [mySearch, setMySearch] = useState('')
  const skillsQuery = useGetAllSkillsQuery({ query: mySearch });

  const skills = array(skillsQuery.data?.results || []);

  const debouncedSetQuery = useMemo(
    () => debounce((value) => {
      setMySearch(value);
    }, 300),
    []
  );
  const handleInputChange = (e: any, newInputValue: any) => {
    debouncedSetQuery(newInputValue);
  };


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
            <Typography variant="h6">{t('candidateSkills')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('defineTitleOfTheJob_selectDepartment')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Stack spacing={3}>
              <Stack>
                <Autocomplete
                  multiple
                  id="tags-standard"
                  value={values?.skills}
                  options={skills}
                  getOptionLabel={(option: any) => option?.name}
                  filterSelectedOptions
                  onInputChange={(e, value) => {
                    handleInputChange(e, value)
                  }}
                  onChange={(e, value) => {
                    setFieldValue('skills', value);
                  }}
                  isOptionEqualToValue={(option: any, value: any) => (option?._id === value?._id) || (option?.name === value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label={t("skills")}
                      placeholder="Favorites"
                    />
                  )}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
