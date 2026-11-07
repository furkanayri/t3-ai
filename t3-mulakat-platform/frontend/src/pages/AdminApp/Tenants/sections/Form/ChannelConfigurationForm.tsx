import { Card, CardContent, Checkbox, Grid, Stack, TextField, Typography } from "@mui/material";
import { useFormikContext } from "formik";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import slugify from "slugify";
import { useAuth } from "src/providers";
import { TenantPayload } from "src/types";

export default function ChannelConfigurationForm() {
    const { t } = useTranslation()

    const { activeTenant } = useAuth()
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
                        xs={12}
                        md={4}
                    >
                        <Typography variant="h6">{t("channelConfiguration")}</Typography>
                        <Typography
                            mt={2}
                            color="text.secondary"
                            variant="body2"
                        >
                            {t("channelConfigurationDescription")}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={8}
                    >
                        <Stack spacing={2}>
                            <div className="flex items-center">
                                <Checkbox
                                    name="hasCareerPage"
                                    value={values.hasCareerPage ?? false}
                                    onChange={handleChange}
                                />
                                <Typography fontWeight={500}>
                                    {t("createCareerPageForTenantQuestion")}
                                </Typography>
                            </div>
                            {hasCareerPage ?
                                <div className="flex gap-2">
                                    <TextField
                                        label="Domain"
                                        value={
                                            slugify(values.name, { lower: true, remove: /[*+~.()'"!:@]/g, trim: true }) + "." +
                                            "heplin.com"
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
                                {t("careerPageDescription")}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
