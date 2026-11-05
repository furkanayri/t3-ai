import {
    Card,
    CardContent,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';

export default function ParentTenantForm() {
    const { t } = useTranslation()
    const { activeTenant } = useAuth()

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
                        <Typography variant="h6">{t("parentCompany")}</Typography>
                        <Typography
                            mt={2}
                            color="text.secondary"
                            variant="body2"
                        >
                            {t("parentCompanyDescription")}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={8}
                    >
                        <Stack
                            spacing={3}
                            flex={1}
                        >
                            <TextField
                                label={t("parentCompany")}
                                value={activeTenant?.name}
                                disabled
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
