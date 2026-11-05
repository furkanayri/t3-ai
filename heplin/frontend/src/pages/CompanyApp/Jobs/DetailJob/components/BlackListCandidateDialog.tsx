
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BlacklistCandidateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export function BlacklistCandidateDialog({
    isOpen,
    onClose,
    onSubmit,
}: BlacklistCandidateDialogProps) {
    const [reason, setReason] = useState('');
    const { t } = useTranslation();
    const handleSubmit = () => {
        onSubmit(reason);
        setReason('');
    };

    return (
        <Dialog
            sx={{
                maxWidth: 'xs',
            }}
            open={isOpen}
            onClose={onClose}
        >
            <DialogTitle> {t("add to blacklist")}</DialogTitle>
            <DialogContent sx={{ width: '400px' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t("Reason for blacklisting")}
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("Cancel")}</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {t("add to blacklist")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}