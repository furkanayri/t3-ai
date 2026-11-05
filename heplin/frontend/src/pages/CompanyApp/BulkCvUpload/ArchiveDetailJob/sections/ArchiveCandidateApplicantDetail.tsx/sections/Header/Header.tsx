import React from 'react';
import { Avatar, Button, Divider, IconButton, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { CloseOutlined, MoreHorizOutlined, StarOutline } from '@mui/icons-material';
import { useCandidateDetail } from '../../ArchiveCandidateApplicantDetail';



const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0)?.toUpperCase() + word.slice(1)?.toLowerCase();
    })
    .join(' ');
};

export default function Header() {
  const theme = useTheme();
  const { onClose, candidateState } = useCandidateDetail();

  const userProfile = candidateState.data;


  return (
    <Stack
      alignItems="flex-start"
      direction="row"
      justifyContent="space-between"
      spacing={2}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div className="flex items-center gap-x-4 flex-1">
        {candidateState.isLoading ? (
          <Avatar sx={{
            width: 56,
            height: 56,
            backgroundColor: theme.palette.neutral[100],
          }}>
            <Skeleton variant="circular" width={56} height={56} />
          </Avatar>
        ) : (
          <Avatar sx={{
            width: 56,
            height: 56,
            backgroundColor: theme.palette.primary.main,
            fontSize: '1.25rem',
            fontWeight: 600,
            border: `3px solid ${theme.palette.primary.lightest}`,
            boxShadow: `0 2px 8px ${theme.palette.primary.alpha30}`,
          }}>
            {userProfile?.name?.[0]?.toUpperCase()}
            {userProfile?.surname?.[0]?.toUpperCase()}
          </Avatar>
        )}
        <div className="space-y-1 flex-1">
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              letterSpacing: '-0.025em',
            }}
          >
            {candidateState.isLoading ? (
              <Skeleton width="40%" />
            ) : (
              <>
                {capitalizeWords(userProfile?.name || '')}  {capitalizeWords(userProfile?.surname || '')}
              </>
            )}
          </Typography>

          {userProfile?.email && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 400,
              }}
            >
              {userProfile.email}
            </Typography>
          )}
        </div>
      </div>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
      >
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: theme.palette.neutral[100],
            color: theme.palette.neutral[500],
            '&:hover': {
              backgroundColor: theme.palette.neutral[200],
              color: theme.palette.neutral[700],
            },
            transition: 'all 0.2s',
          }}
        >
          <CloseOutlined />
        </IconButton>
      </Stack>
    </Stack>
  );
}
