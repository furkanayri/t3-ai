import { IconButton, Tooltip } from "@mui/material"
import { Copy01Icon, InformationCircleIcon } from "hugeicons-react"
import { useSnackbar } from "notistack"
import { copyToClipboard } from "src/utils/text"

export default function IdInfoIcon({ id }: { id: string }) {
    const { enqueueSnackbar } = useSnackbar()
    return (
        <Tooltip title={`id: ${id}`}>
            <div className='flex justify-center items-center'>
                <IconButton onClick={() => {
                    copyToClipboard(id)
                    enqueueSnackbar('Copied to clipboard', { variant: 'success' })
                }}
                    className='group'
                >
                    <div className='group-hover:hidden'>
                        <InformationCircleIcon size={18} />
                    </div>
                    <div className='hidden group-hover:block'>
                        <Copy01Icon size={18} />
                    </div>
                </IconButton>
            </div>
        </Tooltip>
    )
}