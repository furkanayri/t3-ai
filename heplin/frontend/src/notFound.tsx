import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router';

export function NotFound() {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [index, setIndex] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);
    const fullText = 'T3 Bursiyer Platformu';
    const navigate = useNavigate();

    useEffect(() => {
        const handleType = () => {
            setText(prev => isDeleting ? prev.slice(0, -1) : fullText.substring(0, prev.length + 1));

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 500);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setIndex(0);
            }

            setIndex(prev => prev + 1);
        };

        const typingSpeedTimeout = setTimeout(handleType, typingSpeed);

        return () => clearTimeout(typingSpeedTimeout);
    }, [text, isDeleting, typingSpeed, fullText, loopNum]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', // T3 Vakfı koyu mavi
                color: '#fff',
                textAlign: 'center',
                p: 2,
            }}
        >
            <Container>
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {text}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Sayfa Bulunamadı
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ArrowBack />}
                    onClick={() => { navigate(`/`) }}
                    sx={{
                        backgroundColor: '#E31E24',
                        color: '#fff',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        ":hover": {
                            backgroundColor: '#B71C1C',
                        }
                    }}
                >
                    Geri Dön
                </Button>
            </Container>
        </Box>
    );
}
