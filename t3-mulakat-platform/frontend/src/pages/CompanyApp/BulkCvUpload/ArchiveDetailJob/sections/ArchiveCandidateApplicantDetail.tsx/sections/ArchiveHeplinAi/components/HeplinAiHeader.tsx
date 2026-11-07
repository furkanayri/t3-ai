import { Typography } from '@mui/material'
import { MagicWand01Icon } from 'hugeicons-react'
import React from 'react'

const Header = () => {
    return (
        <div className='flex items-center gap-2'>
            <MagicWand01Icon
                size={24}
                color={"#000000"} />
            <Typography variant='h5'>
                {`T3 AI`}
            </Typography>
        </div>
    )
}

export default Header