import {
    Card,
    CardContent,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useAuth } from 'src/providers';

export default function ParentTenantForm() {


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
                        <Typography variant="h6">Parent Tenant</Typography>
                        <Typography
                            mt={2}
                            color="text.secondary"
                            variant="body2"
                        >
                            The parent tenant is the tenant that will be billed for this tenant.
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
                                label={"Parent Tenant"}
                                // value={activeTenant?.name}
                                disabled
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
