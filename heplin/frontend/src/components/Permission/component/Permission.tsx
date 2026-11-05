import { Button, Card, CardContent, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import React from 'react'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from 'src/providers';
import { Link } from 'react-router-dom';
const Permission = () => {
    const { activeTenant } = useAuth();

    return (
        <Stack
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                py: 8
            }}
        >
            <Card sx={{ minWidth: 275, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        İzin Verilmedi
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                        Lütfen yöneticinizden izin talep edin.
                    </Typography>
                    <Button variant="contained" color="primary">
                        <Link to={`mailto:${activeTenant?.email}`}>Yöneticinizle İletişime Geçin</Link>
                    </Button>
                </CardContent>
            </Card>
        </Stack>
    )
}

export default Permission