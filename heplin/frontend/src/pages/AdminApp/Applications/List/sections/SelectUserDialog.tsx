import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import SelectUser from "../../Create/sections/SelectUser";
import { useTranslation } from "react-i18next";

type PropTypes = {
    open: any;
    handleClose: any
}

export default function SelectUserDialog({ open, handleClose }: PropTypes) {
    const { t } = useTranslation()

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            fullWidth
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{t('selectUser')}</DialogTitle>
            <DialogContent className="!pt-4">
                <SelectUser />
            </DialogContent>
        </Dialog>
    )
}