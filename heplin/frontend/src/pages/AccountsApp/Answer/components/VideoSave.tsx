import React, { useState, useRef, useEffect } from "react";
import { Button, Card, LinearProgress } from "@mui/material";
import { useParams } from "react-router";
import { useSnackbar } from "notistack";
import CircleIcon from '@mui/icons-material/Circle';
import { useTranslation } from "react-i18next";
import { useCandidateVideoAnswersUpdateMutation } from "src/hooks/useServices/useInterviewServices";
import { useInterview } from "../../Interviews/InterviewContext/InterviewProvider";
import usePageVisibility from "../../Interviews/hooks/usePageVisibility";
import { useVideoUpload, VideoUploadProgress } from "src/hooks/useVideoUpload";
const VideoSave = ({ onConfirm, question, activeStep }: any) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const [isOpen, setIsopen] = useState(true)
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const { interview, logsMutation } = useInterview()
    const [isVisible, resetVisibility] = usePageVisibility();

    const interviewVideoSaveMutation = useCandidateVideoAnswersUpdateMutation();

    const {
        uploadVideo,
        uploadProgress,
        uploadStatus,
        error: uploadError,
        isLoading: isUploading
    } = useVideoUpload({
        onUploadComplete: (fileKey) => {
            console.log('Video uploaded:', fileKey);
        },
        onError: (error) => {
            console.error('Upload error:', error);
            enqueueSnackbar(t('recordError'), { variant: "error" });
        }
    });


    useEffect(() => {
        if (isVisible) {
            logsMutation.mutateAsync({
                interviewId: interview?._id ?? '',
                payload: {
                    eventType: isVisible && 'tabChange',
                    questionId: question?._id
                }
            },)
        }
    }, [isVisible])

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [isOpen]);

    const startCamera = async () => {
        try {
            if (!videoRef.current) {
                enqueueSnackbar(t('videoReferenceNotAllowed'), { variant: "error" });
                return;
            }

            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;

            const options = {
                mimeType: 'video/webm;codecs=vp8',
                videoBitsPerSecond: 500000
            };

            mediaRecorderRef.current = new MediaRecorder(stream, options);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) chunks.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: "video/webm" });
                setVideoBlob(blob);
                chunks.current = [];
            };

            setIsCameraOpen(true);
        } catch (error) {
            alert("Kameraya erişim izni verilmedi veya bir hata oluştu.");
        }
    };

    const stopCamera = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            mediaRecorderRef.current.stop();
        }

        if (videoRef.current) {
            const stream = videoRef.current.srcObject as MediaStream;
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            videoRef.current.srcObject = null;
        }

        setVideoBlob(null);
        setIsRecording(false);
        setIsCameraOpen(false);
    };

    const startRecording = () => {

        if (mediaRecorderRef.current && !isRecording) {
            mediaRecorderRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSave = async () => {
        if (!videoBlob) {
            console.error("Video kaydedilemedi. Video blob mevcut değil.");
            return;
        }

        if (isSaving) {
            return;
        }

        setIsSaving(true);

        try {
            const { fileKey } = await uploadVideo(
                videoBlob,
                question._id,
                `${question._id}.webm`
            );

            const payload = {
                fileKey,
                question: question?.question,
                questionId: question?._id,
                questionIndex: activeStep + 1,
                responseTime: 0
            };

            await interviewVideoSaveMutation.mutateAsync(
                {
                    candidateAnswerId: interview?.candidateAnswersId ?? '',
                    payload
                },
                {
                    onSuccess: () => {
                        enqueueSnackbar(t('recordSaved'), { variant: "success" });
                        onConfirm();
                        stopCamera();
                        setIsopen(false);
                        setIsSaving(false);
                    },
                    onError(error) {
                        enqueueSnackbar(t('recordError'), { variant: "error" });
                        setIsSaving(false);
                    },
                }
            );

        } catch (error) {
            console.error("Video işleme hatası:", error);
            enqueueSnackbar(t('recordError'), { variant: "error" });
            setIsSaving(false);
        }
    };
    return (
        <div className="max-w-2xl p-4 bg-white rounded-lg shadow-lg mx-auto">
            {
                (interviewVideoSaveMutation.isLoading || isUploading || isSaving) &&
                <LinearProgress color="secondary" />
            }

            {isUploading && (
                <VideoUploadProgress
                    progress={uploadProgress}
                    status={uploadStatus}
                />
            )}

            <div className="flex flex-col gap-4">

                <div className="flex items-center  w-full">
                    <div className="relative ">
                        <video
                            ref={videoRef} muted autoPlay style={{ width: "100%" }} />
                        {
                            isRecording &&
                            <CircleIcon
                                color="error"
                                className="absolute top-2 right-2 animate-bounce"
                            />
                        }
                    </div>
                    <div
                    >
                        {videoBlob && !isRecording && (
                            <video src={URL.createObjectURL(videoBlob)} controls style={{ width: "100%" }} />
                        )}
                    </div>

                </div>
                <div className="flex flex-col gap-4">
                    {/* Kaydı Başlat Butonu */}
                    {!isRecording && !videoBlob && isOpen && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={startRecording}
                            fullWidth
                        >
                            {t('startRecord')}
                        </Button>
                    )}

                    {isRecording && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={stopRecording}
                            fullWidth
                        >
                            {t('stopRecord')}
                        </Button>
                    )}

                    {!isRecording && videoBlob && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={interviewVideoSaveMutation.isLoading || isUploading || isSaving}
                            fullWidth
                        >
                            {(interviewVideoSaveMutation.isLoading || isUploading || isSaving) ? t('Sending') : t('send')}
                        </Button>
                    )}
                    {
                        !videoBlob &&
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setIsopen(isOpen => !isOpen)}
                            disabled={isRecording}
                            fullWidth
                        >
                            {isOpen ? t('cameraOff') : t('cameraOn')}
                        </Button>

                    }

                    {
                        videoBlob && !isRecording && (
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={() => setVideoBlob(null)}
                                disabled={interviewVideoSaveMutation.isLoading || isUploading || isSaving}
                                fullWidth>
                                {t('cancel')}
                            </Button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default VideoSave