import { Add } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { MenuItem, Select, TextField, Tooltip } from "@mui/material"
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { STEP_COLORS } from "src/constants";
import { RecruitmentStageStepPayload, StepColor } from "src/types";

export default function CreateStep() {
    const { t, i18n } = useTranslation()
    const { values, handleBlur, handleChange, errors, touched, isSubmitting, setFieldValue } = useFormikContext<RecruitmentStageStepPayload>();

    return (
        <div className="space-y-4">
            <div>
                <TextField
                    fullWidth
                    label={t("Title")}
                    name="title"
                    onChange={handleChange}
                    value={values.title ?? ''}
                    size="medium"
                    variant="outlined"
                    onBlur={handleBlur}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    required
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    label={t("description")}
                    name="description"
                    onChange={handleChange}
                    value={values.description ?? ''}
                    size="medium"
                    variant="outlined"
                    onBlur={handleBlur}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                />
            </div>
            <div>
                <Select
                    fullWidth
                    value={values?.color ?? 'Grey'}
                    onChange={(e) => {
                        setFieldValue('color', e.target.value)
                    }}
                    sx={{ height: 50 }}
                    native={false}
                    renderValue={(color: StepColor) => (
                        <MenuItem
                            value={color}
                            key={color}
                            sx={{ p: 0 }}
                        >
                            <span className='w-6 h-6' style={{ background: color }}></span>
                            <span className='px-4'>
                                {
                                    i18n.language === 'tr' ?
                                        t(color).toLocaleUpperCase("tr-TR")
                                        : t(color).toUpperCase()
                                }
                            </span>
                        </MenuItem>
                    )}
                >
                    {STEP_COLORS.map((color, i) => (
                        <MenuItem
                            value={color}
                            key={i + color}
                        >
                            <span className='w-6 h-6' style={{ background: color }}></span>
                            <span className='px-4'>
                                {
                                    i18n.language === 'tr' ?
                                        t(color).toLocaleUpperCase("tr-TR")
                                        : t(color).toUpperCase()
                                }
                            </span>
                        </MenuItem>
                    ))}
                </Select>
            </div>
            <div className="text-center md:text-end">
                <Tooltip title={t("Create step")}>
                    <LoadingButton
                        variant="contained"
                        startIcon={<Add />}
                        type="submit"
                        loading={isSubmitting}
                        className="w-full md:w-auto"
                    >
                        {t('Create')}
                    </LoadingButton>
                </Tooltip>
            </div>
        </div>
    )
}