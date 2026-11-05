import { Typography } from "@mui/material"
import { MessageMultiple01Icon } from "hugeicons-react"
import { t } from "i18next"

export default function Header() {
    return (
        <div className='flex items-center gap-2 '>
            <MessageMultiple01Icon
                size={24}
                color={"#E31E24"} />
            <Typography variant='h5' color={"#E31E24"}>
                {t("Interview")}
            </Typography>
        </div>
    )
}