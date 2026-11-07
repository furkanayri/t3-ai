import { Typography } from "@mui/material"
import { ComputerVideoIcon } from "hugeicons-react"
import { t } from "i18next"

export default function Header() {
    return (
        <div className='flex items-center gap-2 '>
            <ComputerVideoIcon
                size={28}
                color={"#E31E24"} />
            <Typography variant='h5' color={"#E31E24"}>
                {t("VideoInterview")}
            </Typography>
        </div>
    )
}