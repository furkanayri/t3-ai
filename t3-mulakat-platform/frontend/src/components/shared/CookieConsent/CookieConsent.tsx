import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setOpen(false);
  };

  const handleClose = () => {
    // Don't allow closing without accepting
    // User must accept cookies
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          margin: 0,
          maxWidth: 'calc(100% - 32px)',
        },
      }}
    >
      <DialogTitle id="cookie-consent-title">
        Çerez Politikası
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="cookie-consent-description" component="div">
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Bu web sitesi, size en iyi deneyimi sunmak için çerezler kullanmaktadır. Web sitesini kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Çerezler hakkında daha fazla bilgi için lütfen{' '}
              <Link
                href="/cookie-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'underline' }}
              >
                Çerez Politikası
              </Link>
              {' '}sayfasını ziyaret edin.
            </Typography>
          </Stack>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAccept}
          fullWidth
        >
          Kabul Et
        </Button>
      </DialogActions>
    </Dialog>
  );
}

