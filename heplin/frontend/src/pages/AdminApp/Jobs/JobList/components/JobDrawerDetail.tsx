import { Drawer } from '@mui/material'
import React from 'react'
import { useDrawer } from '../context/DrawerContext'

const JobDrawerDetail = () => {
    const { toggleDrawer, open, jobId } = useDrawer()
    return (
        <Drawer anchor='right' open={open} onClose={() => toggleDrawer(false, '')}>
            jobId:{jobId}
        </Drawer>
    )
}

export default JobDrawerDetail