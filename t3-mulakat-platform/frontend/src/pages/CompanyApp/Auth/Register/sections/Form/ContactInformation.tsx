import { Delete } from '@mui/icons-material';
import {
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { ConfirmAction } from 'src/components/shared';
import { TenantPayload } from 'src/types/Tenant';
import { array } from 'src/utils';
import { useTranslation } from "react-i18next";

export default function ContactInformation() {
    const { values, handleBlur, handleChange, errors, touched, setFieldValue } =
        useFormikContext<TenantPayload>();
    const { t } = useTranslation();

    const contacts = array<any>(values.contacts);

    const addContact = () => {
        const copyContacts = [...contacts];
        copyContacts.push({
            name: '',
            email: '',
            phone: '',
        });
        setFieldValue('contacts', copyContacts);
    };

    const removeContact = (index: number) => {
        const copyContacts = [...contacts];
        copyContacts.splice(index, 1);
        setFieldValue('contacts', copyContacts);
    };

    const updateContact = (index: number, field: string, value: string) => {
        const copyContacts = [...contacts];
        copyContacts[index][field] = value;
        setFieldValue('contacts', copyContacts);
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

                    >
                        <Stack
                            sx={{ mb: 2 }}
                            divider={<Divider />}
                            spacing={4}
                        >
                            <Stack>
                                <Typography variant="h6">{t('contactInformation')}</Typography>
                                <Typography
                                    mt={2}
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('ContactInformationCompany')}
                                </Typography>
                            </Stack>
                            {contacts.map((contact, ind) => {
                                return (
                                    <Stack
                                        spacing={3}
                                        key={ind}
                                    >
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                        >
                                            <Typography variant="subtitle1">{t('Contact')} {ind + 1}</Typography>
                                            <ConfirmAction
                                                onConfirm={() =>
                                                    new Promise((resolve) => {
                                                        removeContact(ind);
                                                        resolve(true);
                                                    })
                                                }
                                            >
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </ConfirmAction>
                                        </Stack>
                                        <Stack>
                                            <TextField
                                                fullWidth
                                                label={t('name_surname')}
                                                name={`contacts.${ind}.name`}
                                                value={values.contacts[ind].name ?? ''}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                        </Stack>
                                        <Stack
                                            direction={{
                                                xs: 'column',
                                                sm: 'row',
                                            }}
                                            spacing={1}
                                        >
                                            <Stack flex={1}>
                                                <TextField
                                                    fullWidth
                                                    label={t('email')}
                                                    name={`contacts.${ind}.email`}
                                                    value={values.contacts[ind].email ?? ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    required
                                                />
                                            </Stack>
                                            <Stack flex={1}>
                                                <TextField
                                                    fullWidth
                                                    label={t('phone')}
                                                    name={`contacts.${ind}.phone`}
                                                    value={values.contacts[ind].phone ?? ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    required
                                                />
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Stack>
                        <Button onClick={() => addContact()}>{t('addContact')}</Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
