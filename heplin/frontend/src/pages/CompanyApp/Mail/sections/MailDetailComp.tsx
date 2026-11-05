import { ArrowBack, Download, Send } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, CircularProgress, Container, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useGetMailDetailQuery, usePostNewMailMutation } from "src/hooks/useServices";
import { useRef, useState } from "react";
import { array } from "src/utils";
import { downloadMailAttachmentService } from "src/services";

function formatSize(size: number): string {
    if (size < 1024) {
        return size + " B";
    } else if (size < 1024 * 1024) {
        const kbSize = (size / 1024).toFixed(2);
        return kbSize + " KB";
    } else {
        const mbSize = (size / (1024 * 1024)).toFixed(2);
        return mbSize + " MB";
    }
}

export default function MailDetailComp({ threadId, goBack }: { threadId?: string, goBack?: () => void }) {
    const ref = useRef<any>();
    const [height, setHeight] = useState("0px");
    const [downloadingAttachmentId, setDownloadingAttachmentId] = useState("");
    const [replyMessage, setReplyMessage] = useState("");

    const onLoad = () => {
        setHeight(ref.current.contentWindow.document.body.scrollHeight + 50 + "px");
    };

    const mailThreadQuery = useGetMailDetailQuery({ id: threadId! });

    const mails = (mailThreadQuery.data?.mails?.results || []).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const replyMailMutation = usePostNewMailMutation();

    const handleSendReply = () => {
        const lastMail = mails[mails.length - 1];
        replyMailMutation.mutate(
            {
                to: lastMail.from.address,
                subject: `Re: ${lastMail.subject}`,
                body: replyMessage,
                threadId: lastMail.threadId,
            },
            {
                onSuccess: () => {
                    setReplyMessage("");
                    mailThreadQuery.refetch();
                },
                onError: (error: any) => {
                    console.error("Reply failed:", error);
                },
            }
        );
    };

    const handleDownloadAttachment = async (attachment: any) => {
        try {
            setDownloadingAttachmentId(attachment?._id);
            const blob = await downloadMailAttachmentService({ id: attachment?.id, fileKey: attachment?.filekey });

            const url = window.URL.createObjectURL(new Blob([blob]));

            const link = document.createElement('a');
            link.href = url;
            link.download = attachment?.filename;

            document.body.appendChild(link);

            link.click();

            link?.parentNode?.removeChild(link);
        } catch (error: any) {

        } finally {
            setDownloadingAttachmentId("");
        }
    };

    return (
        <Box component="main" sx={{ flexGrow: 1 }}>
            <Container maxWidth={'xl'}>
                <Stack spacing={2} mb={3}>
                    <Stack gap={1} flexDirection={"row"}>
                        <IconButton onClick={() => goBack?.()} size="small">
                            <ArrowBack fontSize="small" />
                        </IconButton>
                        <Typography variant="subtitle1" fontSize={20}>
                            {mails[0]?.subject}
                        </Typography>
                    </Stack>

                    {mails.map((mailItem: any, index: any) => (
                        <Stack key={index} spacing={2}>
                            <Stack flexDirection={"row"} alignItems={"center"} gap={1}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    {(mailItem.from.name || mailItem.from.address)?.[0]?.toUpperCase()}
                                </Avatar>
                                <Typography variant="subtitle2">
                                    {mailItem.from.name || ''}
                                </Typography>
                                <Typography variant="caption" color={"text.secondary"}>
                                    {mailItem.from.address}
                                </Typography>
                            </Stack>

                            {mailItem.html ? (
                                <Card sx={{ borderRadius: 0, background: "#eee" }}>
                                    <CardContent>
                                        <Stack flexDirection={"row"} justifyContent={"center"}>
                                            <Stack>
                                                <iframe
                                                    ref={ref}
                                                    onLoad={onLoad}
                                                    id="myFrame"
                                                    width="100%"
                                                    height={height}
                                                    scrolling="no"
                                                    frameBorder="0"
                                                    style={{
                                                        width: "100%",
                                                        minWidth: "50vw",
                                                        overflow: "auto",
                                                        background: "#fff",
                                                    }}
                                                    srcDoc={mailItem.html}
                                                />
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card sx={{ borderRadius: 0, boxShadow: 0 }}>
                                    <CardContent>
                                        <Typography variant="body1">{mailItem.text}</Typography>
                                    </CardContent>
                                </Card>
                            )}

                            <Stack flexDirection={"row"} flexWrap={"wrap"} gap={2}>
                                {array<any>(mailItem.attachments).map((attachment, i) => (
                                    <Card key={i} sx={{ width: 200, py: 1, px: 2 }}>
                                        <Stack gap={1} flexDirection={"row"}>
                                            <div>
                                                <Typography variant="subtitle2">
                                                    {attachment.filename}
                                                </Typography>
                                                <Typography mt={1} variant="caption" color={"text.secondary"}>
                                                    {formatSize(Number(attachment.size))}
                                                </Typography>
                                            </div>
                                            <div>
                                                <IconButton
                                                    onClick={() => handleDownloadAttachment(attachment)}
                                                    disabled={downloadingAttachmentId === attachment?._id}
                                                    size="small"
                                                >
                                                    <Download fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>

                <Stack mt={2} gap={2} flexDirection="row" justifyContent="center">
                    <TextField
                        label="Yanıtınızı yazın"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={1}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        sx={{ maxWidth: "70%" }}
                    />
                    <IconButton color="primary" onClick={handleSendReply} disabled={replyMailMutation.isLoading}>
                        <Send />
                    </IconButton>
                </Stack>
            </Container>
        </Box>
    );
}
