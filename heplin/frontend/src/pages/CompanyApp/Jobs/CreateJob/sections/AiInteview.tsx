import { ArrowDropDownOutlined, CheckBox } from '@mui/icons-material'
import { Button, Card, CardContent, Grid, Menu, MenuItem, Switch, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'
import { JobForm } from 'src/types/jobPost'
import { Quotas } from 'src/types/Quotas'

function AiInteview({ quatas }: { quatas: Quotas }) {
    const { t } = useTranslation()
    const { values, touched, errors, handleChange, handleBlur } = useFormikContext<JobForm>()


    const options = [
        {
            label: 'YesAIinterview',
            value: 'yes'
        },
        {
            label: 'NoAiInterview',
            value: 'no'
        }
    ]
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
                        <Typography variant="h6">{t('interview')}</Typography>
                        <Typography
                            mt={2}
                            color="text.secondary"
                            variant="body2"
                        >
                            {t('createaiInterviewDescription')}
                        </Typography>
                    </Grid>
                    <Grid item
                        xs={12}
                        md={8}>
                        <Stack spacing={3}>
                            <div className='flex items-center w-full gap-4'>

                                <TextField
                                    label={t('HeplinAiInterview')}
                                    name="aiInterview"
                                    disabled={!quatas?.aiFeatures?.interview?.isActive || quatas?.aiFeatures?.evaluation?.remainingCount <= 0}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    error={touched.aiInterview && !!errors.aiInterview}
                                    helperText={touched.aiInterview && errors.aiInterview ? t(errors.aiInterview) : ''}
                                    value={values.aiInterview ?? ''}
                                    select
                                    sx={{ flexGrow: 1 }}
                                    fullWidth
                                >
                                    {options?.map((item, i) => (
                                        <MenuItem
                                            key={i}
                                            value={item.value}
                                        >
                                            {t(item.label)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </Stack>
                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    )
}

export default AiInteview