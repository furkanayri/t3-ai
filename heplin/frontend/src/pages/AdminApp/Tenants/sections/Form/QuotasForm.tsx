import React from "react";
import { TextField, Grid, Typography, Checkbox, FormControlLabel } from "@mui/material";
import { useFormikContext } from "formik";
import { Quotas } from "src/types/Quotas";
import { useTranslation } from "react-i18next";

const FormComponent = () => {
    const { handleChange, setFieldValue, values } = useFormikContext<Quotas>();

    const { t } = useTranslation()
    return (
        <div>
            <Typography variant="h5" gutterBottom>
                {
                    t('editQuota')
                }
            </Typography>
            <Grid container spacing={3}>
                {/* Email Section */}
                <Grid item xs={12}>
                    <Typography variant="h6">{t('email')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        name="email.credit"
                        label="Credit"
                        type="number"
                        fullWidth
                        value={values.email.credit}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        name="email.remainingCredit"
                        label="Remaining Credit"
                        type="number"
                        fullWidth
                        value={values.email.remainingCredit}
                        onChange={handleChange}
                    />
                </Grid>

                {/* Job Section */}
                <Grid item xs={12}>
                    <Typography variant="h6">{t('job')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        name="job.credit"
                        label="Credit"
                        type="number"
                        fullWidth
                        value={values.job.credit}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        name="job.remainingCredit"
                        label="Remaining Credit"
                        type="number"
                        fullWidth
                        value={values.job.remainingCredit}
                        onChange={handleChange}
                    />
                </Grid>

                {/* AI Features Section - Interview */}
                <Grid item xs={12}>
                    <Typography variant="h6">{t('aiFeatures')} -{t('VideoInterview')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={values.aiFeatures.videoInterview.isActive}
                                onChange={(e) =>
                                    setFieldValue(
                                        "aiFeatures.videoInterview.isActive",
                                        e.target.checked
                                    )
                                }
                            />
                        }
                        label="Is Active"
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name="aiFeatures.videoInterview.maxAllowed"
                        label="Max Allowed"
                        type="number"
                        fullWidth
                        value={values.aiFeatures.videoInterview.maxAllowed}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name="aiFeatures.videoInterview.remainingCount"
                        label="Remaining Count"
                        type="number"
                        fullWidth
                        value={values.aiFeatures.videoInterview.remainingCount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">{t('aiFeatures')} - {t('Interview')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={values.aiFeatures.interview.isActive}
                                onChange={(e) =>
                                    setFieldValue(
                                        "aiFeatures.interview.isActive",
                                        e.target.checked
                                    )
                                }
                            />
                        }
                        label="Is Active"
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name="aiFeatures.interview.maxAllowed"
                        label="Max Allowed"
                        type="number"
                        fullWidth
                        value={values.aiFeatures.interview.maxAllowed}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name="aiFeatures.interview.remainingCount"
                        label="Remaining Count"
                        type="number"
                        fullWidth
                        value={values.aiFeatures.interview.remainingCount}
                        onChange={handleChange}
                    />
                </Grid>

                {/* AI Features Section - Evaluation */}
                <Grid item xs={12}>
                    <Typography variant="h6">AI Features - Evaluation</Typography>
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={values.aiFeatures.evaluation.isActive}
                                onChange={(e) =>
                                    setFieldValue(
                                        "aiFeatures.evaluation.isActive",
                                        e.target.checked
                                    )
                                }
                            />
                        }
                        label="Is Active"
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name="aiFeatures.evaluation.maxAllowed"
                        label="Max Allowed"
                        type="number"
                        fullWidth
                        value={values.aiFeatures.evaluation.maxAllowed}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name="aiFeatures.evaluation.remainingCount"
                        label="Remaining Count"
                        type="number"
                        fullWidth
                        value={values.aiFeatures.evaluation.remainingCount}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default FormComponent;
