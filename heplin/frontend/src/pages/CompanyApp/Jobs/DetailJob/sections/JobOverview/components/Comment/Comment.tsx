import { Delete } from '@mui/icons-material';
import { Avatar, IconButton, Typography } from '@mui/material';
import { intlFormatDistance, isValid } from 'date-fns';
import { useAuth } from 'src/providers';

type CommentProps = {
  createdBy: {
    _id: string;
    name: string;
    surname: string;
    avatar?: string;
  };
  users: any,
  content: string;
  createdAt: string;
  onDelete: () => void;
};

export default function Comment({ users, createdAt, createdBy, content, onDelete }: CommentProps) {
  const commentDate = new Date(createdAt);
  const { user } = useAuth();
  const displayUser = createdBy === users._id ? users : createdBy;

  return (
    <div className="group ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2 py-4">
          <Avatar
            sx={{ width: 30, height: 30, fontSize: 12 }}
            src={displayUser.avatar}
          >
            {displayUser.name?.[0]}{displayUser.surname?.[0]}
          </Avatar>
          <Typography variant="subtitle2">
            {`${displayUser.name} ${displayUser.surname}`}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            {isValid(commentDate)
              ? intlFormatDistance(commentDate, new Date(), {
                numeric: 'always',
              })
              : null}
          </Typography>
        </div>
        {user?._id && createdBy && (
          <IconButton
            onClick={() => onDelete()}
            color="error"
            size="small"
            className="opacity-0 group-hover:opacity-100"
          >
            <Delete />
          </IconButton>
        )}
      </div>
      <div>
        <Typography variant="body2">{content}</Typography>
      </div>
    </div>
  );
}
