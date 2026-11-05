import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { SDK_KEY, USER_EMAIL, LEAVE_URL_ACCOUNT, LEAVE_URL_COMPANY } from 'src/constants';
import { usePostMeetingSignatureMutation } from 'src/hooks/useServices/useMeetingServices';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface MeetingDialogProps {
    open: boolean;
    onClose: () => void;
    url: string | null;
}

const MeetingDialogCandidate: React.FC<MeetingDialogProps> = ({ open, onClose, url }) => {
    const [zoomLoaded, setZoomLoaded] = useState(false);
    const [ZoomMtg, setZoomMtg] = useState<any>(null);
    const [meetingStarted, setMeetingStarted] = useState(false);
    const [decodedPayload, setDecodedPayload] = useState<any>(null);
    const { t } = useTranslation();

    const postNewMeetingMutation = usePostMeetingSignatureMutation();

    useEffect(() => {
        let isMounted = true;
        (async () => {
            const lodash = await import('lodash');
            (window as any)._ = lodash.default || lodash;

            const zoomModule = await import('@zoom/meetingsdk');
            if (isMounted) {
                zoomModule.ZoomMtg.preLoadWasm();
                // zoomModule.ZoomMtg.prepareWebSDK();
                setZoomMtg(zoomModule.ZoomMtg);
                setZoomLoaded(true);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);


    useEffect(() => {
        if (url) {
            const urlObj = new URL(url);
            const user = urlObj.searchParams.get("user");
            if (user) {
                const token: any = user;
                const payload = token.split('.')[1];
                const decoded = JSON.parse(window.atob(payload));
                setDecodedPayload(decoded);
            }
        }
    }, [url]);

    if (!url) {
        return null;
    }

    if (!decodedPayload) {
        return <p>Invalid URL</p>;
    }
    var sdkKey = SDK_KEY;
    var userEmail = USER_EMAIL;
    var registrantToken = '';

    let leaveUrl: any;
    if (decodedPayload.role === 0) {
        leaveUrl = LEAVE_URL_ACCOUNT;
    } else if (decodedPayload.role === 1) {
        leaveUrl = LEAVE_URL_COMPANY;
    }

    const meetingNum = parseInt(decodedPayload.meetingNumber, 10);

    function getSignature(e: any) {
        e.preventDefault();

        postNewMeetingMutation.mutate(
            { meetingNumber: meetingNum, role: decodedPayload.role },
            {
                onSuccess: (response) => {
                    startMeeting(response.signature);
                    setMeetingStarted(true);
                },
                onError: (error) => {
                    console.error('Error fetching signature:', error);
                },
            }
        );
    }

    function startMeeting(signature: any) {
        if (!ZoomMtg) return;

        ZoomMtg.init({
            leaveUrl: leaveUrl,
            patchJsMedia: true,
            isSupportAV: true,
            success: (success: any) => {
                console.log('ZoomMtg.init success:', success);
                ZoomMtg.join({
                    signature: signature,
                    sdkKey: sdkKey,
                    meetingNumber: meetingNum,
                    passWord: decodedPayload.passWord,
                    userName: decodedPayload.userName,
                    userEmail: userEmail,
                    tk: registrantToken,
                    zak: decodedPayload.zak,
                    success: (success: any) => {
                        console.log('ZoomMtg.join success:', success);
                        setMeetingStarted(true);
                    },
                    error: (error: any) => {
                        console.error('ZoomMtg.join error:', error);
                    }
                });
            },
            error: (error: any) => {
                console.error('ZoomMtg.init error:', error);
            }
        });
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    width: '80%',
                    maxWidth: '800px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '80vh',
                },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 0 }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                {meetingStarted ? (
                    <div style={{ flexGrow: 1, width: '100%' }}>
                        <div id="zmmtg-root" style={{ height: '100%', width: '100%' }}>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        flexGrow: 1,
                        width: "100%",
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "15px",
                        padding: "20px",
                    }}>
                        <img src="/assets/logo.png" alt="T3" style={{ width: "150px", height: "auto" }} />
                        <span style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
                            {t("Welcome")}{" " + decodedPayload.userName}!
                        </span>
                        <button
                            style={{
                                background: "#36BCFF",
                                color: "white",
                                fontWeight: "bold",
                                padding: "10px 20px",
                                fontSize: "16px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            onClick={getSignature}
                        >
                            {t("Join Meeting")}
                        </button>
                    </div>
                )}


            </DialogContent>
        </Dialog>
    );
};

export default MeetingDialogCandidate;