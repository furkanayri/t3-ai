import { useState, type FC } from 'react';
import PropTypes from 'prop-types';
import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { intlFormatDistance, isValid, format } from 'date-fns';
import { Scrollbar } from 'src/components/scrollbar';
import { useNavigate } from 'react-router-dom';
import type { Notification } from './types';
import { Construction } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Modal } from '@mui/material';
import { useDeleteNotificationMutation, useGetAllNotificationQuery } from 'src/hooks/useServices/useNotificationServices';

interface NotificationsPopoverProps {
  anchorEl: null | Element;
  notifications: Notification[];
  onClose?: () => void;
  onMarkAllAsRead?: () => void;
  onRemoveOne?: (id: string) => void;
  open?: boolean;
}

export const NotificationsPopover: FC<NotificationsPopoverProps> = (props) => {
  const { t, i18n } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [notificationInfo, setNotificationInfo] = useState<any>();
  const {
    anchorEl,
    notifications,
    onClose,
    onMarkAllAsRead,
    onRemoveOne,
    open = false,
    ...other
  } = props;

  const isEmpty = notifications?.length === 0;
  const navigate = useNavigate();
  const deletePlan = useDeleteNotificationMutation();
  const notificationQuery = useGetAllNotificationQuery();
  const handleDeletePlan = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    try {
      await deletePlan.mutateAsync({ id: id ?? "" });
      notificationQuery.refetch();
    } catch (error) {

    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom',
      }}
      disableScrollLock
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 450 } }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          px: 3,
        }}
      >
      </Stack>
      {isEmpty ? (
        <Box display={"flex"} gap={"5px"} alignItems={"center"} padding={"15px"}>
          <Box display={"flex"} justifyContent={"center"} alignItems={"center"} sx={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#E31E24" }}>
            <NotificationsActiveOutlinedIcon sx={{ color: "white", fontSize: "18px" }} />
          </Box>
          <p className='figtreeFonts' style={{ color: "black", fontSize: "13px" }}>{t('no_notification_yet')}</p>
        </Box>
      ) : (
        <Scrollbar sx={{ maxHeight: 400 }}>
          <List disablePadding>
            {notifications?.map((notification) => (
              <ListItem onClick={() => { navigate(`/${notification?.link}`); onClose && onClose(); }}
                divider
                key={notification._id}
                sx={{
                  cursor: "pointer",
                  alignItems: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiListItemSecondaryAction-root': {
                    top: '24%',
                  },
                }}
                secondaryAction={
                  <Tooltip title={t('remove')}>
                    <IconButton
                      edge="end"
                      onClick={(event) => handleDeletePlan(event, notification._id)}
                      size="small"
                      sx={{ color: '#E31E24' }}
                    >
                      <SvgIcon>
                        <XIcon />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                }
              >
                <Box sx={{ display: "flex", gap: "15px", cursor: "pointer" }} >
                  <Box sx={{ backgroundColor: "#E31E24", height: "31px", width: "51px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <NotificationsActiveOutlinedIcon sx={{ color: "white", fontSize: "16px" }} />
                  </Box>
                  <Box>
                    <p style={{ color: "#6B7280", fontWeight: "600", fontSize: "14px" }} className='figtreeFonts'>{t(`${notification?.title}`)}</p>
                    <p style={{ color: "#6B7280", fontWeight: "400", fontSize: "10px" }} className='figtreeFonts'>{t(`${notification?.content}`)}</p>
                    <Tooltip
                      title={
                        isValid(new Date(notification?.createdAt))
                          ? format(new Date(notification?.createdAt), 'yyyy.MM.dd kk:mm')
                          : null
                      }
                    >
                      <Typography
                        color="text.secondary"
                        sx={{ color: "#BFC8E8", fontSize: "11px", fontWeight: 800, mt: 0.5 }}
                        variant="body2"
                        className="capitalize figtreeFonts"

                      >
                        {isValid(new Date(notification?.createdAt))
                          ? intlFormatDistance(
                            new Date(notification?.createdAt),
                            new Date(),
                            {
                              locale: i18n.language,
                              numeric: 'always',
                            }
                          )
                          : null}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>

                {/* {renderContent(notification)} */}
              </ListItem>
            ))}
          </List>
        </Scrollbar>
      )}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: "8px", minWidth: "400px" }}>
          <Box >
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>

              <p className='platformFont' style={{ color: "#E31E24", fontSize: "34px", textAlign: "center" }}>{t(notificationInfo?.title)}</p>

            </Box>
            <Box sx={{ marginBottom: "25px" }}>
              <p className='figtreeFonts' style={{ fontSize: "17px", fontWeight: 700, marginBottom: "10px", textAlign: "justify" }}>{t(notificationInfo?.content)}</p>

            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className='variant-yellow-button'
                onClick={() => {
                  navigate(`/${notificationInfo?.link}`);
                }}
              >
                {notificationInfo?.buttonLabel || t('check')}
              </button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  notifications: PropTypes.array.isRequired,
  onClose: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
  onRemoveOne: PropTypes.func,
  open: PropTypes.bool,
};
