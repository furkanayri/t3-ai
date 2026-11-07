import { Button, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNewMail } from "src/providers";

export default function Header({ senderMailAddress }: { senderMailAddress: string }) {
    const { t } = useTranslation()
    const { openNewMail } = useNewMail()
    return <Stack mb={2} flexDirection={"row"} alignItems={"center"} justifyContent={"space-between"}>
        <Stack>
            <Typography variant='h6'>
                {t("Mailbox")}
            </Typography>
            <Typography mt={1} variant='caption' color="text.secondary">
                {senderMailAddress}
            </Typography>
        </Stack>
        <Button size='small' onClick={() => openNewMail()}>
            {t("New Email")}
        </Button>
    </Stack>
}