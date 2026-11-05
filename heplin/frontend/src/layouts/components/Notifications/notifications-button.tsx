import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { usePopover } from 'src/hooks/use-popover';
import type { Notification } from './types';
import { notifications as initialNotifications } from './types';
import { NotificationsPopover } from './notifications-popover';
import { Box } from '@mui/system';
import { useGetAllNotificationQuery, useUpdateNotificationMutation } from 'src/hooks/useServices/useNotificationServices';
import { SvgIcon } from '@mui/material';
import { Notification01Icon } from 'hugeicons-react';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unread = useMemo((): number => {
    return notifications.reduce((acc, notification) => acc + (notification.read ? 0 : 1), 0);
  }, [notifications]);

  const handleRemoveOne = useCallback((notificationId: string): void => {
    setNotifications((prevState) => {
      return prevState.filter((notification) => notification._id !== notificationId);
    });
  }, []);

  const handleMarkAllAsRead = useCallback((): void => {
    setNotifications((prevState) => {
      return prevState.map((notification) => ({
        ...notification,
        read: true,
      }));
    });
  }, []);

  return {
    handleMarkAllAsRead,
    handleRemoveOne,
    notifications,
    unread,
  };
};

export const NotificationsButton: FC = () => {
  const popover = usePopover<HTMLButtonElement>();
  const { handleMarkAllAsRead, unread } = useNotifications();
  const notificationQuery = useGetAllNotificationQuery();
  const notificationData = notificationQuery?.data?.results;
  const updateNotificationMutation = useUpdateNotificationMutation();
  const { t } = useTranslation();
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await notificationQuery.refetch();
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
    }, 180000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClick = async () => {
    try {
      await updateNotificationMutation.mutateAsync();
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      return;
    }
    notificationQuery.refetch();
  };

  return (
    <>
      <Box sx={{
        position: "relative",
        display: "flex",
        marginRight: "20px",
      }} onClick={handleClick}>
        <Tooltip title={t('notifications')}>
          <IconButton
            ref={popover.anchorRef}
            onClick={popover.handleOpen}
            size='small'
          >
            <Badge color="error" badgeContent={unread}>
              <SvgIcon sx={{ fontSize: 20 }}>
                <Notification01Icon style={{ color: "#E31E24" }} />
              </SvgIcon>
            </Badge>
          </IconButton>
        </Tooltip>
        {notificationData?.filter((x: any) => x?.isRead == false)?.length > 0 ?
          <Box sx={{ position: "absolute", top: -10, right: -5, backgroundColor: "#E31E24", padding: "2px 6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "8px", color: "white" }}>{notificationData?.filter((x: any) => x?.isRead == false)?.length}</p>
          </Box>
          : null}

      </Box>
      <NotificationsPopover
        anchorEl={popover.anchorRef.current}
        notifications={notificationData}
        onClose={popover.handleClose}
        onMarkAllAsRead={handleMarkAllAsRead}
        open={popover.open}
      />
    </>
  );
};
