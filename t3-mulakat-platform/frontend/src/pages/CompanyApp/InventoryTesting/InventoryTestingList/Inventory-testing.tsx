import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'

export const Component = () => {
    const navigate = useNavigate()

    const handleNavigateToDimensions = () => {
        navigate('dimensions')
    }

    return (
        <div>
            <Button
                variant="contained"
                onClick={handleNavigateToDimensions}
            >
                Dimensions
            </Button>
        </div>
    )
}

Component.displayName = 'InventoryTesting';
