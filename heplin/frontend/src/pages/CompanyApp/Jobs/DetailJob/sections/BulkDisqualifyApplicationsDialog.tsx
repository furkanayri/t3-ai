import {
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
    Divider,
    DialogActions,
    Button,
    Typography,
    TextField,
} from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';

interface IPropTypes {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
}

export default function BulkDisqualifyApplicationsDialog({
    isOpen,
    onClose,
    onSubmit,
}: IPropTypes) {
    const [disqualifyReason, setDisqualifyReason] = useState<string>('');

    return (
        <Dialog maxWidth="md" open={isOpen} onClose={onClose}>
            <DialogTitle>{t('disqualifyAllCandidates')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} divider={<Divider />}>
                    <Typography>
                        {t('Are you sure you want to disqualify all candidates')}
                    </Typography>
                    <TextField
                        fullWidth
                        label={t('reasonForDisqualification')}
                        name="content"
                        value={disqualifyReason}
                        onChange={(e) => {
                            setDisqualifyReason(e.target.value as string);
                        }}
                        multiline
                        rows={3}
                    />
                </Stack>
                <DialogActions>
                    <Button onClick={onClose}>{t('cancel')}</Button>
                    <Button
                        color="error"
                        onClick={() => {
                            onSubmit(disqualifyReason);
                        }}
                    >
                        {t('Confirm')}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}
