import {
    Autocomplete,
    Divider,
    Drawer,
    IconButton,
    Input,
    InputBase,
    Stack,
    TextField,
    Tooltip,
    Typography,
    backdropClasses
} from '@mui/material';
import { CloseOutlined, DeleteOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import { usePostNewMailMutation } from 'src/hooks/useServices';
import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNewMail } from 'src/providers';
import { array } from 'prop-types';
import { EmailTemplate } from '../../../types';


export default function NewMail() {

    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const { isOpenNewMail, closeNewMail, newMailState, emailTemplates } = useNewMail();

    const { initialTo, lockToField, onSendSuccess } = newMailState;

    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const newMailMutation = usePostNewMailMutation();
    // const mailTemplates = useMemo(() => array<EmailTemplate>(emailTemplates), [emailTemplates]); // hata veriyordu kullanımda değildi

    useEffect(() => {
        setTo(initialTo || '');
    }, [initialTo, isOpenNewMail]);

    useEffect(() => {
        if (!!selectedTemplate) {
            setSubject(selectedTemplate.subject);
            setMessage(selectedTemplate.message);
        }
        else {
            setSubject('');
            setMessage('');
        }
    }, [selectedTemplate]);

    const resetFields = () => {
        setTo('');
        setSubject('');
        setMessage('');
        setSelectedTemplate(null);
    };

    const handleSendMail = () => {
        newMailMutation.mutate(
            {
                to,
                subject,
                body: message,
            },
            {
                onSuccess: () => {
                    resetFields();
                    closeNewMail();
                    enqueueSnackbar(t('emailSentSuccessfully'), { variant: 'success' });
                    onSendSuccess?.();
                },
            }
        );
    };
    return (
        <Drawer
            variant="persistent"
            anchor="bottom"
            ModalProps={{
                sx: {
                    [`& .${backdropClasses.root}`]: {
                        background: 'transparent !important',
                    },
                },
            }}
            onClose={closeNewMail}
            open={isOpenNewMail}
            PaperProps={{
                sx: {
                    overflow: 'hidden',
                    maxWidth: '100%',
                    width: '30vw',
                    right: 30,
                    left: 'unset',
                    boxShadow: 2,
                    height: '70vh',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                },
            }}
            sx={{ flexShrink: 0 }}
        >
            <Stack
                px={2}
                py={1}
                flexDirection={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
                sx={{ backgroundColor: 'neutral.50' }}
            >
                <Typography variant="subtitle1">{t('New Mail')}</Typography>
                <IconButton
                    onClick={closeNewMail}
                    size="small"
                >
                    <CloseOutlined fontSize="small" />
                </IconButton>
            </Stack>
            <Divider />
            <Stack
                px={2}
                py={1}
                flex={1}
            >
                <Input
                    size="medium"
                    sx={{ py: 0.5, mb: 1, ':before': { borderBottomColor: 'neutral.200' } }}
                    placeholder={t('to')}
                    value={to}
                    onChange={(e) => !lockToField && setTo(e.target.value)} />
                <Input
                    size="medium"
                    sx={{ py: 0.5, ':before': { borderBottomColor: 'neutral.200' } }}
                    placeholder={t('Subject')}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)} />
                <Stack flex={1}>
                    <InputBase
                        sx={{ py: 0.5, mt: 2, fontSize: '14px', color: 'currentcolor' }}
                        multiline
                        rows={13}
                        placeholder={t('Type your message here')}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} />
                </Stack>
                <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    borderTop={"1px solid lightgray"}
                    paddingTop={2}
                >
                    <LoadingButton
                        loading={newMailMutation.isLoading}
                        onClick={handleSendMail}
                        size="small"
                        variant="contained"
                        sx={{ minWidth: 150 }}
                    >
                        {t('send')}
                    </LoadingButton>
                    <div className='flex gap-2 items-center'>
                        {/*
            
             <Autocomplete
              fullWidth
              disablePortal
              options={expertiseList}
              onChange={(event: any, value: any) => {
                setValue('selectedExpertiseType', value)
              }}
              loading={semestersQuery.isLoading}
              getOptionLabel={(option: any) => option.name}
              renderInput={params => (
                <TextField
                  name="selectedExpertiseType"
                  onBlur={handleBlur}
                  error={
                    !!formState.errors.selectedExpertiseType &&
                    formState.touched.selectedExpertiseType
                  }
                  helperText={
                    formState.touched.selectedExpertiseType &&
                    formState.errors.selectedExpertiseType
                  }
                  {...params}
                  label="İhtisas"
                />
              )}
            />
            */}
                        <Autocomplete
                            noOptionsText={t("noTemplatesFound")}
                            disablePortal
                            size='small'
                            options={emailTemplates ?? []}
                            value={selectedTemplate ?? null}
                            onChange={(event: any, value: any) => {
                                if (value)
                                    setSelectedTemplate(value);

                                else
                                    setSelectedTemplate(null);
                            }}
                            getOptionLabel={(opt) => opt.title}
                            renderInput={(params: any) => (
                                <TextField
                                    {...params}
                                    hiddenLabel
                                    placeholder={t("selectTemplate")} />
                            )}
                            sx={{ width: 200 }} />
                        <Tooltip title={t("clear")}>
                            <IconButton
                                size="small"
                                onClick={resetFields}
                            >
                                <DeleteOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Stack>
            </Stack>
        </Drawer>
    );
}
