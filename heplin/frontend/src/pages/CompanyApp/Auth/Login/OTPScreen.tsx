import { LoadingButton } from '@mui/lab';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useEffect, useRef, useState } from 'react';
import Countdown from 'react-countdown';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';
import * as Yup from 'yup';

interface Values {
    code: string;
}

const initialValues: Values = {
    code: '',
};

const OTPExpiresSecond = 120;

function CountDown({ resendOTP }: { resendOTP: () => void }) {
    const { t } = useTranslation();
    // const { sentOTPCount } = useAuth();
    const [countStart, setCountStart] = useState<number>(0);

    const countDownRef = useRef<Countdown>(null);

    // useEffect(() => {
    //     if (sentOTPCount > 0) {
    //         countDownRef.current?.start();
    //         setCountStart(Date.now() + OTPExpiresSecond * 1000);
    //     }
    // }, [sentOTPCount]);

    if (!countStart) return null;

    return <Countdown
        key={countStart}
        ref={countDownRef}
        date={countStart}
        renderer={({ minutes, seconds, completed }) => {
            if (completed) {
                // Render a completed state
                return <Button onClick={resendOTP}>Resend Code</Button>;
            } else {
                // Render a countdown
                const time = `${minutes?.toString().padStart(2, '0')}:${seconds
                    ?.toString()
                    .padStart(2, '0')}`;
                return <span>{t('Resend code in {{time}}', { time })}</span>;
            }
        }}
    />
}

export default function OTPScreen({
    open,
    onClose,
    phone,
}: {
    open: boolean;
    phone: string;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    // const { loginWithPhone, verifyOTP, loginLoading, sentOTPCount } = useAuth();

    const validationSchema = Yup.object({
        code: Yup.string().length(6).required(t('Code is required')),
    });

    // const formik = useFormik({
    //     initialValues,
    //     validationSchema,
    //     onSubmit: (values) => {
    //         verifyOTP(phone, values.code);
    //     },
    // });

    // const handleClose = () => {
    //     formik.resetForm();
    //     onClose();
    // };
    // const resendOTP = () => {
    //     formik.setFieldValue('code', '');
    //     loginWithPhone(phone);
    // };

    return (
        <></>
    );
}

/*
    <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogContent>
                <form
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <Stack spacing={3}>
                        <Alert severity="info">{t('We have sent a verification code to your phone.')}</Alert>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {sentOTPCount > 0 && <CountDown resendOTP={resendOTP} />}
                        </Typography>
                        <MuiOtpInput
                            length={6}
                            onBlur={formik.handleBlur}
                            onChange={(value) => formik.setFieldValue('code', value)}
                            onFocus={() => formik.setFieldTouched('code')}
                            sx={{
                                '& .MuiFilledInput-input': {
                                    p: '14px',
                                },
                            }}
                            value={formik.values.code}
                        />
                        <LoadingButton
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            loading={loginLoading}
                        >
                            {t('Verify')}
                        </LoadingButton>
                    </Stack>

                </form>
            </DialogContent>

        </Dialog>
*/