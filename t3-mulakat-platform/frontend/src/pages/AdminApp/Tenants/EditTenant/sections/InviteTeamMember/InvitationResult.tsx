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

export default function InvitationResult({
    results,
    onClose,
}: {
    results: any[];
    onClose: () => void;
}) {
    if (results.length === 0) return null
    return (
        <Dialog
            open={results.length > 0}
            onClose={onClose}
        >
            <DialogTitle>Invitation Results</DialogTitle>
            <Divider sx={{ my: 2 }} />
            <DialogContent>
                <Stack
                    spacing={2}
                    divider={<Divider />}
                >
                    {results.map((result, index) => {
                        return (
                            <div key={index}>
                                <Stack
                                    direction="row"
                                    justifyContent={'space-between'}
                                    spacing={4}
                                    alignItems={"center"}
                                >
                                    <Stack>{result?.email}</Stack>
                                    <Stack>
                                        {!result?.success ? (
                                            <Chip
                                                label="Failed"
                                                color="error"
                                            />
                                        ) : (
                                            <Chip
                                                label="Success"
                                                color="success"
                                            />
                                        )}
                                    </Stack>
                                </Stack>
                                {result?.message && (
                                    <Stack mt={2}>
                                        <Alert severity="error">{result?.message}</Alert>
                                    </Stack>
                                )}
                            </div>
                        );
                    })}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}
