import { Box, Checkbox, FormHelperText, FormLabel, Stack, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RegisterPayload } from 'src/types/user';

export default function Policies() {
    const { t } = useTranslation()
    const formik = useFormikContext<RegisterPayload>();
    return (
        <>
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    ml: -1,
                    mt: 1,
                }}
            >
                <Checkbox
                    id="acceptedTOSCheckbox"
                    checked={formik.values.isAcceptedTOS}
                    name="policy"
                    onChange={(e) => {
                        formik.setFieldValue('isAcceptedTOS', e.target.checked);
                    }}
                    onBlur={formik.handleBlur}
                />
                <FormLabel
                    sx={{ display: 'flex' }}
                    htmlFor="acceptedTOSCheckbox"
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            {t("I have read the")}
                        </Typography>
                        <Typography
                            color="primary"
                            variant="body2"
                        >
                            <Link
                                target="_blank"
                                to="/terms-and-conditions.html"
                            >
                                {t("Terms and Conditions")}
                            </Link>
                        </Typography>
                    </Stack>
                </FormLabel>
            </Box>
            {!!(formik.touched.isAcceptedTOS && formik.errors.isAcceptedTOS) && (
                <FormHelperText error>{formik.errors.isAcceptedTOS}</FormHelperText>
            )}

            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    ml: -1,
                    mt: 1,
                }}
            >
                <Checkbox
                    id="acceptedKVKKCheckbox"
                    checked={formik.values.isAcceptedKVKK}
                    name="policy"
                    onChange={(e) => {
                        formik.setFieldValue('isAcceptedKVKK', e.target.checked);
                    }}
                    onBlur={formik.handleBlur}
                />
                <FormLabel
                    sx={{ display: 'flex' }}
                    htmlFor="acceptedKVKKCheckbox"
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            {t("I have read the")}
                        </Typography>
                        <Typography
                            color="primary"
                            variant="body2"
                        >
                            <Link
                                target="_blank"
                                to="/kvkk.html"
                            >
                                {t("KVKK Compliance Statement")}
                            </Link>
                        </Typography>
                    </Stack>
                </FormLabel>
            </Box>
            {!!(formik.touched.isAcceptedKVKK && formik.errors.isAcceptedKVKK) && (
                <FormHelperText error>{formik.errors.isAcceptedKVKK}</FormHelperText>
            )}
        </>
    );
}
