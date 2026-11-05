import {
    Card,
    CardContent,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useGetAllTenantsQuery } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { JobForm } from 'src/types/jobPost';

import { array } from 'src/utils';


const SelectTenant = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams()

    const { values, handleBlur, setFieldValue, errors, touched } = useFormikContext<JobForm>();
    const tenantsQuery = useGetAllTenantsQuery()
    const tenantsData = array<any>(tenantsQuery.data?.results);

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
                        <Typography variant="h6">{t("selectTenant")}</Typography>
                        <Typography
                            mt={2}
                            color="text.secondary"
                            variant="body2"
                        >
                            {t("selectTenantDescription")}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={8}
                    >
                        <Stack spacing={3}>
                            <Stack>
                                <TextField
                                    fullWidth
                                    label={t('Company')}
                                    name="skills"
                                    value={values?.tenantId}
                                    onChange={(e) => {
                                        setFieldValue(
                                            'tenantId',
                                            typeof e.target.value === 'string'
                                                ? e.target.value
                                                : e.target.value
                                        );
                                        setFieldValue('publishedChannels', [])
                                        setFieldValue('hiringTeams', [])
                                        setSearchParams((prev) => {
                                            prev.set('tenantId', e.target.value);
                                            return prev;
                                        });
                                    }}
                                    onBlur={handleBlur}
                                    error={touched.skills && !!errors.skills}
                                    // helperText={touched.skills && errors.skills?.join(", ")}
                                    select
                                    required
                                >
                                    {tenantsData.map((subTenant: any) => (
                                        <MenuItem
                                            key={subTenant?._id}
                                            value={subTenant?._id}
                                        >
                                            {subTenant.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card >
    )
}

export default SelectTenant