import {
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  Snackbar,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRouter } from 'src/hooks/use-router';
import { format, isValid } from 'date-fns';
import { ArrowDown01Icon, ArrowUp01Icon, CalendarAdd01Icon, Copy01Icon, Delete02Icon, Mail02Icon, MoreVerticalSquare01Icon, PencilEdit02Icon } from 'hugeicons-react';
import { StepChip } from 'src/components/shared';
import { useNewMail } from 'src/providers';
import MeetingDialog from './MeetingDialog';

type PropTypes = {
  mode: 'upcoming' | 'completed';
  meeting: any;
  deleteMeeting: any;
  updateMeeting: any;
};

const meetingTypeColorMapper = {
  "onsite": "#FD5FB2",
  "online": "#0FB900",
  "phone": "#F3A815",
}

const MeetingCard = ({ meeting, deleteMeeting, updateMeeting, mode }: PropTypes) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogUrl, setDialogUrl] = useState<string | null>(null);
  const { openNewMail } = useNewMail();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (link: any) => {
    setOpen(true);
    navigator.clipboard.writeText(link);
  };

  const handleOpen = async () => setIsOpen((pre) => !pre);

  const handleDelete = async () => {
    setAnchorEl(null);
    await deleteMeeting(meeting._id);
  };

  const handleUpdate = async () => {
    setAnchorEl(null);
    const newStatus = mode === 'upcoming' ? 'completed' : 'initial';
    await updateMeeting(meeting._id, { ...meeting, status: newStatus });
  };

  const meetingDate = new Date(meeting?.date);
  const createdAtMonth = isValid(meetingDate)
    ? format(meetingDate, 'LLL').toUpperCase()
    : '-';
  const meetingDay = isValid(meetingDate) ? format(meetingDate, 'd') : '-';
  const handleDialogClick = (e: React.MouseEvent, url: string | undefined) => {
    e.preventDefault();
    if (url) {
      setDialogUrl(url);
      setDialogOpen(true);
    } else {
      console.log("URL not found.");
    }
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogUrl(null);
  };

  return (
    <>
      <TableRow>
        <TableCell align='center'>
          <div className='text-sm bg-[#FFEBEE] text-[#E31E24] capitalize rounded-[10px] px-[5px] py-[6px] text-center'>
            <p>{createdAtMonth?.toLowerCase()}</p>
            <p className='font-bold'>{meetingDay}</p>
          </div>
        </TableCell>

        <TableCell align='center'>
          <p className='text-base font-medium'>
            {format(meetingDate, 'HH:mm')}
          </p>
        </TableCell>

        <TableCell align='center'>
          <p className='text-[#979797]'>
            {meeting?.jobId?.title}
          </p>
        </TableCell>

        <TableCell align='center'>
          {meeting?.candidateId?.name + ' ' + meeting?.candidateId?.surname}
        </TableCell>

        <TableCell align='center'>
          <p style={{ color: meetingTypeColorMapper[meeting?.type as "onsite" | "online" | "phone"], fontWeight: 500 }}>
            {t(meeting?.type)}
          </p>
        </TableCell>

        <TableCell align='center'>
          <p className='text-[#979797]'>
            {meeting?.hostId?.name + ' ' + meeting?.hostId?.surname}
          </p>
        </TableCell>

        <TableCell align='right'>
          <div className='flex gap-2 justify-end items-center cursor-pointer duration-300'>
            <div
              className='flex justify-center items-center hover:bg-slate-100  w-max rounded'
              onClick={handleOpen}
            >
              <p className='text-[#E31E24] font-medium py-1 pl-2'>
                {t('details')}
              </p>
              {isOpen ?
                <ArrowUp01Icon size={18} color='#E31E24' /> :
                <ArrowDown01Icon size={18} color='#E31E24' />
              }
            </div>
            <div
              className='p-1 hover:bg-slate-100 rounded'
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVerticalSquare01Icon size={18} color='#E31E24' />
            </div>
          </div>
        </TableCell>
      </TableRow>

      {isOpen && (
        <TableRow>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell>
            <div className='flex justify-center'>
              <StepChip
                step={meeting?.recruitmentStageStepId}
              />
            </div>
          </TableCell>
          <TableCell>
            <div className='flex flex-col w-max mx-auto'>
              <div className='cursor-pointer'
                onClick={() => openNewMail({
                  initialTo: meeting?.candidateId?.email,
                  lockToField: true,
                })}
              >
                <Tooltip title={t('sendEmail')}>
                  <div>
                    <IconButton size='small'>
                      <Mail02Icon size={18} color='#558EFA' />
                    </IconButton>
                    <span className='text-[#558EFA]'>{meeting?.candidateId?.email}</span>
                  </div>
                </Tooltip>
              </div>
              {meeting?.type == "online" &&
                <div>
                  <Tooltip title={t('copyToClipboard')}>
                    <IconButton size='small' onClick={() => handleClick(meeting?.candicateUrl)} color="primary" sx={{ padding: "0", paddingLeft: "5px" }}>
                      <Copy01Icon size={18} color='#558EFA' />
                    </IconButton>
                  </Tooltip>
                  {/* <Tooltip title={t('openInNewTab')}>
                    <Link target='_blank' to={meeting?.candicateUrl} style={{ color: "#558EFA", paddingLeft: "4px" }}>
                      {t('CandicateMeetingUrl')}
                    </Link>
                  </Tooltip> */}
                  <Tooltip title={t('openMeetingDialog')}>
                    <Link
                      to="#"
                      onClick={(e) => handleDialogClick(e, meeting?.candicateUrl)}
                      style={{ color: "#558EFA", paddingLeft: "4px" }}
                    >
                      {t('CandicateMeetingUrl')}
                    </Link>
                  </Tooltip>
                </div>
              }
            </div>
          </TableCell>
          <TableCell></TableCell>
          <TableCell>
            <div className='flex flex-col w-max mx-auto'>
              <div className='cursor-pointer'
                onClick={() => openNewMail({
                  initialTo: meeting?.hostId?.email,
                  lockToField: true,
                })}
              >
                <Tooltip title={t('sendEmail')}>
                  <div>
                    <IconButton size='small'>
                      <Mail02Icon size={18} color='#558EFA' />
                    </IconButton>
                    <span className='text-[#558EFA]'>{meeting?.hostId?.email}</span>
                  </div>
                </Tooltip>
              </div>
              {meeting?.type == "online" &&
                <div>
                  <Tooltip title={t('copyToClipboard')}>
                    <IconButton size='small' onClick={() => handleClick(meeting?.adminUrl)} color="primary" sx={{ padding: "0", paddingLeft: "5px" }}>
                      <Copy01Icon size={18} color='#558EFA' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('openMeetingDialog')}>
                    <Link
                      to="#"
                      onClick={(e) => handleDialogClick(e, meeting?.adminUrl)}
                      style={{ color: "#558EFA", paddingLeft: "4px" }}
                    >
                      {t('AdminMeetingUrl')}
                    </Link>
                  </Tooltip>
                </div>
              }
            </div>
          </TableCell>
          {meeting.attendees && (
            <TableCell>
              <div className='flex flex-col w-max mx-auto gap-4'>
                {meeting.attendees.map((attendee: any) => (
                  <div key={attendee.employeeId} className='cursor-pointer'>
                    <Tooltip title={t('sendEmail')}>
                      <div>
                        <IconButton size='small'>
                          <Mail02Icon size={18} color='#558EFA' />
                        </IconButton>
                        <span className='text-[#558EFA]'>{attendee?.employeeId.email}</span>
                      </div>
                    </Tooltip>
                    {meeting?.type == "online" &&
                      <div>
                        <Tooltip title={t('copyToClipboard')}>
                          <IconButton size='small' onClick={() => handleClick(meeting?.candicateUrl)} color="primary" sx={{ padding: "0", paddingLeft: "5px" }}>
                            <Copy01Icon size={18} color='#558EFA' />
                          </IconButton>
                        </Tooltip>
                        {/* <Tooltip title={t('openInNewTab')}>
                          <Link target='_blank' to={attendee?.attendeeUrl} style={{ color: "#558EFA", paddingLeft: "4px" }}>
                            {t('EmployeeMeetingUrl')}
                          </Link>
                        </Tooltip> */}
                        <Tooltip title={t('openMeetingDialog')}>
                          <Link
                            to="#"
                            onClick={(e) => handleDialogClick(e, attendee?.attendeeUrl)}
                            style={{ color: "#558EFA", paddingLeft: "4px" }}
                          >
                            {t('EmployeeMeetingUrl')}
                          </Link>
                        </Tooltip>
                      </div>
                    }
                  </div>
                ))}
              </div>
            </TableCell>
          )}
          <TableCell></TableCell>
          <Snackbar
            message={t("copiedToClipboard")}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            autoHideDuration={2000}
            onClose={() => setOpen(false)}
            open={open}
          />
        </TableRow>
      )}

      <MeetingDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        url={dialogUrl}
      />

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={handleUpdate}
          sx={{ borderBottom: "1px solid #d9d9d9" }}
        >
          <CalendarAdd01Icon size={18} />
          <p className='pl-2'>
            {mode == 'upcoming' ? t('markAsCompleted') : t('markAsUpcoming')}
          </p>
        </MenuItem>
        <MenuItem
          onClick={() => router.push(`${meeting._id}`)}
          sx={{ borderBottom: "1px solid #d9d9d9" }}
        >
          <PencilEdit02Icon size={18} />
          <p className='pl-2'>
            {t('edit_meeting')}
          </p>
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
        >
          <Delete02Icon size={18} />
          <p className='pl-2'>
            {t('deleteMeeting')}
          </p>
        </MenuItem>
      </Menu>
    </>
  );
};

export default MeetingCard;
