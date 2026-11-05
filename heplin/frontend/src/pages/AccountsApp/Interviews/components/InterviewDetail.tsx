import { Button, Card, CardActions, CardContent, Typography, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Videocam, Mic, VideocamOff, MicOff, Close } from '@mui/icons-material';
import { useCheckEligibility } from 'src/hooks/useServices/usePersonelityTest';

const InterviewDetail = ({ interview, handleStartInterview, isExpired = false }: { interview: any, handleStartInterview?: any, isExpired?: boolean }) => {
    const { t } = useTranslation();
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [hasVideoPermission, setHasVideoPermission] = useState(false);
    const [hasAudioPermission, setHasAudioPermission] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [showLowVolumeWarning, setShowLowVolumeWarning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lowVolumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const eligibility = useCheckEligibility()
    const personalityTestCompleted = eligibility.data?.existingSession?.status === 'completed';
    const isEligibilityLoading = eligibility.isLoading || eligibility.isFetching;
    const expirationDate = interview?.expirationDate ? new Date(interview.expirationDate) : null;
    const isInterviewExpired = expirationDate ? new Date() > expirationDate : false;

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (lowVolumeTimeoutRef.current) {
                clearTimeout(lowVolumeTimeoutRef.current);
            }
        };
    }, [stream]);

    useEffect(() => {
        if (stream && hasAudioPermission) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;
            microphone.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            lowVolumeTimeoutRef.current = setTimeout(() => {
                setShowLowVolumeWarning(true);
            }, 5000);

            const detectSound = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const normalizedLevel = Math.min(100, average);
                setAudioLevel(normalizedLevel);

                if (normalizedLevel > 5) {
                    setShowLowVolumeWarning(false);
                    if (lowVolumeTimeoutRef.current) {
                        clearTimeout(lowVolumeTimeoutRef.current);
                        lowVolumeTimeoutRef.current = null;
                    }
                }

                animationFrameRef.current = requestAnimationFrame(detectSound);
            };

            detectSound();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (lowVolumeTimeoutRef.current) {
                clearTimeout(lowVolumeTimeoutRef.current);
            }
        };
    }, [stream, hasAudioPermission]);

    const requestMediaPermissions = async () => {
        setIsCheckingPermissions(true);
        setPermissionError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setStream(mediaStream);
            setHasVideoPermission(true);
            setHasAudioPermission(true);
            setPermissionError(null);
        } catch (error: any) {
            console.error('Media permission error:', error);

            let errorMessage = t('mediaPermissionError');

            if (error.name === 'NotAllowedError') {
                errorMessage = t('mediaPermissionDenied');
            } else if (error.name === 'NotFoundError') {
                errorMessage = t('mediaDeviceNotFound');
            } else if (error.name === 'NotReadableError') {
                errorMessage = t('mediaDeviceInUse');
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = t('mediaConstraintsNotSatisfied');
            } else if (error.name === 'NotSupportedError') {
                errorMessage = t('mediaNotSupported');
            }

            setPermissionError(errorMessage);
            setHasVideoPermission(false);
            setHasAudioPermission(false);
        } finally {
            setIsCheckingPermissions(false);
        }
    };

    const handleOpenPermissionDialog = () => {
        setShowPermissionDialog(true);
        setPermissionError(null);
        setTimeout(() => {
            requestMediaPermissions();
        }, 100);
    };

    const handleClosePermissionDialog = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (lowVolumeTimeoutRef.current) {
            clearTimeout(lowVolumeTimeoutRef.current);
            lowVolumeTimeoutRef.current = null;
        }
        setShowPermissionDialog(false);
        setPermissionError(null);
        setHasVideoPermission(false);
        setHasAudioPermission(false);
        setAudioLevel(0);
        setShowLowVolumeWarning(false);
    };

    const handleConfirmAndStart = () => {
        if (hasVideoPermission && hasAudioPermission && handleStartInterview) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setShowPermissionDialog(false);
            handleStartInterview();
        }
    };

    const checkMediaPermissions = async () => {
        handleOpenPermissionDialog();
    };

    return (
        <div className='max-w-4xl mx-auto'>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        {interview?.name || t('InterviewNameNotSpecified')}
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        <strong>{t('totalTime')}:</strong> {interview?.totalDuration || 0} dakika
                    </Typography>


                    <Typography variant="body1" color={isInterviewExpired ? 'red' : "text.secondary"}>
                        <strong>{t('endDate')}:</strong>{' '}
                        {expirationDate ? expirationDate.toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        <strong>{t('interviewType')}:</strong> {t(interview?.interviewType + 'L') || 'Belirtilmedi'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={2}>
                        {t('interviewInfo')}
                    </Typography>

                    {permissionError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <AlertTitle>{t('error')}</AlertTitle>
                            {permissionError}
                        </Alert>
                    )}

                    {
                        isInterviewExpired &&
                        < Typography variant="body2" color="red" mt={2}>
                            {t('datePassed')}
                        </Typography>
                    }
                    {
                        !isExpired &&
                        <div className='flex justify-end flex-col gap-2'>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Button
                                    variant='outlined'
                                    disabled={isInterviewExpired || isCheckingPermissions || isEligibilityLoading || !personalityTestCompleted}
                                    onClick={checkMediaPermissions}>

                                    {isCheckingPermissions ? t('checkingPermissions') : t('startInterview')}
                                </Button>
                            </CardActions>
                            {
                                !isEligibilityLoading && !personalityTestCompleted &&
                                <div>
                                    <Alert>
                                        Kişilik envanter testi tamamlanmadan mülakat başlatılamaz.
                                    </Alert>
                                </div>
                            }
                        </div>
                    }
                </CardContent>
            </Card>

            <Dialog
                open={showPermissionDialog}
                onClose={handleClosePermissionDialog}
                maxWidth="md"
                fullWidth
                scroll="paper"
                sx={{
                    '& .MuiDialog-paper': {
                        maxHeight: '90vh',
                        m: 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{t('mediaPermissionCheck')}</Typography>
                        <IconButton onClick={handleClosePermissionDialog} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box>
                        <Box
                            sx={{
                                position: 'relative',
                                backgroundColor: '#000',
                                borderRadius: 2,
                                overflow: 'hidden',
                                mb: 2,
                                aspectRatio: '16/9',
                                maxHeight: { xs: '200px', sm: '300px', md: '400px' }
                            }}
                        >
                            {stream ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    height="100%"
                                    color="white"
                                >
                                    <VideocamOff sx={{ fontSize: 64, opacity: 0.5 }} />
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {hasVideoPermission ? (
                                    <Videocam color="success" fontSize="small" />
                                ) : (
                                    <VideocamOff color="error" fontSize="small" />
                                )}
                                <Typography variant="body2">
                                    {hasVideoPermission ? t('cameraPermissionGranted') : t('cameraPermissionRequired')}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {hasAudioPermission ? (
                                    <Mic color="success" fontSize="small" />
                                ) : (
                                    <MicOff color="error" fontSize="small" />
                                )}
                                <Typography variant="body2">
                                    {hasAudioPermission ? t('microphonePermissionGranted') : t('microphonePermissionRequired')}
                                </Typography>
                            </Box>

                            {hasAudioPermission && showLowVolumeWarning && audioLevel < 5 && (
                                <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
                                    <AlertTitle sx={{ fontSize: '0.875rem' }}>{t('lowVolumeWarning')}</AlertTitle>
                                    <Typography variant="body2">{t('lowVolumeMessage')}</Typography>
                                </Alert>
                            )}

                            {hasAudioPermission && (
                                <Box sx={{ mt: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                                        {t('microphoneLevel')}
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: 1,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: 8,
                                                width: `${audioLevel}%`,
                                                backgroundColor: audioLevel > 5 ? '#4caf50' : '#9e9e9e',
                                                transition: 'width 0.1s ease-out, background-color 0.3s'
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {t('speakToTestMicrophone')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {permissionError && (
                            <Alert severity="error" sx={{ mb: 1.5 }}>
                                <AlertTitle sx={{ fontSize: '0.875rem' }}>{t('error')}</AlertTitle>
                                <Typography variant="body2">{permissionError}</Typography>
                                <Box mt={1.5}>
                                    <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                                        {t('howToEnablePermissions')}
                                    </Typography>
                                    <Typography variant="caption" component="div">
                                        <ol style={{ marginLeft: '16px', marginTop: '4px', paddingLeft: '4px' }}>
                                            <li style={{ marginBottom: '4px' }}>{t('permissionStep1')}</li>
                                            <li style={{ marginBottom: '4px' }}>{t('permissionStep2')}</li>
                                            <li style={{ marginBottom: '4px' }}>{t('permissionStep3')}</li>
                                        </ol>
                                    </Typography>
                                </Box>
                            </Alert>
                        )}

                        {!stream && !permissionError && (
                            <Alert severity="info">
                                <Typography variant="body2">{t('mediaPermissionInfo')}</Typography>
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                        onClick={handleClosePermissionDialog} 
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: { xs: '100px', sm: 'auto' } }}
                    >
                        {t('cancel')}
                    </Button>
                    {permissionError && (
                        <Button
                            onClick={requestMediaPermissions}
                            variant="contained"
                            disabled={isCheckingPermissions}
                            size="small"
                            sx={{ minWidth: { xs: '100px', sm: 'auto' } }}
                        >
                            {isCheckingPermissions ? t('checkingPermissions') : t('retryPermissions')}
                        </Button>
                    )}
                    {!stream && !permissionError && (
                        <Button
                            onClick={requestMediaPermissions}
                            variant="contained"
                            disabled={isCheckingPermissions}
                            size="small"
                            sx={{ minWidth: { xs: '100px', sm: 'auto' } }}
                        >
                            {isCheckingPermissions ? t('checkingPermissions') : t('allowPermissions')}
                        </Button>
                    )}
                    {stream && hasVideoPermission && hasAudioPermission && (
                        <Button
                            onClick={handleConfirmAndStart}
                            variant="contained"
                            color="primary"
                            disabled={audioLevel <= 5}
                            size="small"
                            sx={{ minWidth: { xs: '100px', sm: 'auto' } }}
                        >
                            {t('startInterview')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div >
    )
}

export default InterviewDetail
