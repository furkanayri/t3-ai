import { Stack, Typography, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PageHeader() {
    const { t } = useTranslation()
    return <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
            position: 'sticky',
            top: 64,
            backdropFilter: 'blur(6px)',
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
            zIndex: 99,
            paddingLeft: '1rem',
            paddingRight: "1rem"
        }}
    >
        <Typography variant="h4">{
            t("Onboard")
        }</Typography>
    </Stack>
} 