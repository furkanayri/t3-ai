import { Card, CardContent, Checkbox, Grid, Stack, TextField, Typography } from "@mui/material";
import { useFormikContext } from "formik";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import slugify from "slugify";
import { TenantPayload } from "src/types/Tenant";
export default function ChannelConfigurationForm() {
    const { i18n } = useTranslation()

    const { values, handleBlur, handleChange, errors, touched, setFieldValue } =
        useFormikContext<TenantPayload>();

    const hasCareerPage = useMemo(() => values.hasCareerPage, [values.hasCareerPage])

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

                        <Stack spacing={2}>
                            <Stack>

                                <Typography variant="h6">Channel Configuration</Typography>
                                <Typography
                                    mt={2}
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    These settings determine which channels will the new tenant will create job posts on.

                                </Typography>
                            </Stack>

                            <div className="flex items-center">
                                <Checkbox
                                    name="hasCareerPage"
                                    value={values.hasCareerPage ?? false}
                                    onChange={handleChange}
                                />
                                <Typography fontWeight={500}>
                                    Create a career page for this tenant?
                                </Typography>
                            </div>
                            {hasCareerPage ?
                                <div className="flex gap-2">
                                    {/* <TextField
                                        name="careerPageSubdomain"
                                        label="Career Page Subdomain"
                                        value={values.careerPageSubdomain ?? ''}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.careerPageSubdomain && !!errors.careerPageSubdomain}
                                        helperText={touched.careerPageSubdomain && errors.careerPageSubdomain}
                                        required
                                    /> */}
                                    <TextField
                                        label="Domain"
                                        value={
                                            slugify(values.name, { lower: true, remove: /[*+~.()'"!:@]/g, trim: true }) + "."
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        sx={{ flexGrow: 1 }}
                                        disabled
                                    />
                                </div>
                                : null}
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                Career page is a subdomain where this tenant will share their own company job posts. They can publish on this channel directly without an approval process.
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
