import React, { Dispatch, SetStateAction, useMemo, useState } from 'react';
import {
    Autocomplete,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Close } from '@mui/icons-material/';
import { Skill } from 'src/types/';
import { useSnackbar } from 'notistack';
import {
    useDeleteCandidateSkillMutation,
    useGetAllCandidateSkillsQuery,
    useGetAllSkillsQuery,
    usePostNewCandidateSkillMutation,
    useUpdateCandidateSkillMutation,
} from 'src/hooks/useServices';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { array } from 'src/utils';
import debounce from 'lodash.debounce';
import { useAuth } from 'src/providers';

interface IPropTypes {
    data: Skill;
    mode: 'create' | 'edit';
    setDrawerOpen: Dispatch<SetStateAction<boolean>>;
    refetch: any;
}
const Drawer = ({ data, mode, setDrawerOpen, refetch }: IPropTypes) => {
    const { user } = useAuth()
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar();
    const [mySearch, setMySearch] = useState('')
    const postNewSkillMutation = usePostNewCandidateSkillMutation();
    const updateSkillMutation = useUpdateCandidateSkillMutation();
    const deleteSkillMutation = useDeleteCandidateSkillMutation();

    const skillsQuery = useGetAllSkillsQuery({ query: mySearch });
    const debouncedSetQuery = useMemo(
        () => debounce((value) => {
            setMySearch(value);
        }, 300),
        []
    );
    const handleInputChange = (e: any, newInputValue: any) => {
        e.preventDefault();
        debouncedSetQuery(newInputValue);
    };
    const skills = array(skillsQuery.data?.results);

    const initialValues: any = {
        skills: data?.skills || [],
    };
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => {
                if (values.skills.length === 0) {
                    enqueueSnackbar(t('Please select at least one skill.'), { variant: 'error' });
                    return;
                }
                const payload = {
                    skills: values.skills,
                }
                if (mode === 'create') {
                    postNewSkillMutation.mutateAsync(
                        payload,
                        {
                            onSuccess: (data) => {
                                enqueueSnackbar(t('Created new skill.'), { variant: 'success' });
                                setDrawerOpen(false);
                                refetch();
                            },
                            onError: (err) => {
                                enqueueSnackbar((err as any).message, { variant: 'error' });
                            },
                        }
                    );
                } else {
                    updateSkillMutation.mutateAsync(
                        { id: data?._id ?? '', payload: { ...values } },
                        {
                            onSuccess: (data) => {
                                enqueueSnackbar(t('skill updated.'), { variant: 'success' });
                                setDrawerOpen(false);
                                refetch();
                            },
                            onError: (err) => {
                                enqueueSnackbar((err as any).message, { variant: 'error' });
                            },
                        }
                    );
                }
            }}
        >
            {({ handleSubmit, values, handleBlur, handleChange, setFieldValue, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                    <Stack
                        spacing={3}
                        sx={{ mb: 3, p: { xs: 4, md: 6 } }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Typography variant="h6">
                                {mode === 'create' ? t('New Skill') : t('Edit Skill')}
                            </Typography>
                            <Tooltip title="Cancel">
                                <IconButton onClick={() => setDrawerOpen(false)}>
                                    <Close />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        <Stack maxWidth={400} width={400}>
                            <Stack>
                                <Autocomplete
                                    multiple
                                    id="tags-standard"
                                    value={values?.skills}
                                    options={skills}
                                    getOptionLabel={(option: any) => option?.name}
                                    filterSelectedOptions
                                    loading={skillsQuery?.isFetching}
                                    noOptionsText={skills.length <= 0 && t("No Options")}
                                    loadingText={<CircularProgress color="inherit" size={20} />}
                                    onInputChange={(e, value) => {
                                        handleInputChange(e, value)
                                    }}
                                    onChange={(e, value) => {
                                        setFieldValue('skills', value);
                                    }}
                                    isOptionEqualToValue={(option: any, value: any) => (option?._id === value?._id) || (option?.name === value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            label={t("skills")}
                                            placeholder="Skills"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {skillsQuery?.isFetching ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Stack>
                        </Stack>
                        <Stack
                            justifyContent="flex-start"
                            alignItems="center"
                            spacing={1}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                color="grey"
                            >
                                <Button
                                    fullWidth
                                    color={mode === 'edit' ? 'error' : 'inherit'}
                                    onClick={() => {
                                        if (mode === 'edit') {
                                            deleteSkillMutation.mutateAsync(
                                                { id: data?._id ?? '' },
                                                {
                                                    onSuccess: (data) => {
                                                        enqueueSnackbar(t('Skill deleted.'), { variant: 'info' });
                                                        refetch();
                                                        setDrawerOpen(false);
                                                    },
                                                    onError: (err) => {
                                                        enqueueSnackbar(t('Unable to delete skill.') + (err as any).message, {
                                                            variant: 'error',
                                                        });
                                                    },
                                                }
                                            );
                                        } else {
                                            setDrawerOpen(false);
                                        }
                                    }}
                                >
                                    {mode === 'edit' ? t('Delete') : t('Cancel')}
                                </Button>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                >
                                    {t('Save')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </form>
            )}
        </Formik>
    );
};

export default Drawer;
