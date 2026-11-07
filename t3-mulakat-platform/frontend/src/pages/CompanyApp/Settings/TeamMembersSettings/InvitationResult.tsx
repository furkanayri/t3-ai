import {
    Alert,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function InvitationResult({ isOpen, onClose, email, }: { isOpen: boolean; onClose: () => void; email?: string; }) {
    const { t } = useTranslation()
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogTitle>{t('invitationResult')}</DialogTitle>
            <Divider sx={{ my: 2 }} />
            <DialogContent>
                <Stack
                    spacing={2}
                    divider={<Divider />}
                >
                    <Stack
                        direction="row"
                        justifyContent={'space-between'}
                        spacing={4}
                        alignItems={"center"}
                    >
                        <Stack>{email}</Stack>
                        <Stack>
                            <Chip
                                label={t("Success")}
                                color="success"
                            />
                        </Stack>
                    </Stack>
                    <Stack mt={2}>
                        <Alert severity="success">{
                            t("emailSentSuccessfully")
                        }</Alert>
                    </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <DialogActions>
                    <Button onClick={onClose}>{t('close')}</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}
