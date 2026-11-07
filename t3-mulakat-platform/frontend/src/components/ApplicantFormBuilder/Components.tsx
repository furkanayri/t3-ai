import { AddOutlined, CloseOutlined } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  FormGroup,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export function TextAnswer() {
  return null;
}

export function NumberAnswer() {
  return null;
}

export function MultilineAnswer() {
  return null;
}

export function VideoAnswer() {
  return (
    <Typography
      color="text.secondary"
      variant="body2"
    >
      The answer show here
    </Typography>
  );
}

export function ChoiseAnswer({
  options,
  onAddItem,
  onRemoveItem,
  onChangeItem,
}: {
  options: string[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onChangeItem: (value: string, itemIndex: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <Typography
        variant="subtitle2"
        className="pb-2"
      >
        {t("Options")}
      </Typography>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
      >
        {options.map((opt, index) => {
          return (
            <div
              key={index}
              className="flex items-center group"
            >
              <Radio
                size="small"
                disabled
              />
              <input
                autoFocus
                value={opt}
                onChange={(e) => onChangeItem(e.target.value, index)}
                className="flex-1 py-2 px-2 transition-all flex border rounded-md border-transparent group-hover:border-gray-400"
              />
              <IconButton
                size="small"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => onRemoveItem(index)}
              >
                <CloseOutlined fontSize="small" />
              </IconButton>
            </div>
          );
        })}
      </RadioGroup>
      <Button
        color="inherit"
        sx={{ color: 'text.secondary' }}
        startIcon={<AddOutlined />}
        size="small"
        onClick={() => onAddItem()}
      >
        Add option
      </Button>
    </div>
  );
}

export function MultipleChoiseAnswer({
  options,
  onAddItem,
  onRemoveItem,
  onChangeItem,
}: {
  options: string[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onChangeItem: (value: string, itemIndex: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <Typography
        variant="subtitle2"
        className="pb-2"
      >
        {t("Options")}
      </Typography>
      <FormGroup>
        {options.map((opt, index) => {
          return (
            <div
              key={index}
              className="flex items-center group"
            >
              <Checkbox
                disabled
                size="small"
              />
              <input
                autoFocus
                value={opt}
                onChange={(e) => onChangeItem(e.target.value, index)}
                className="flex-1 py-2 px-2 transition-all flex border rounded-md border-transparent group-hover:border-gray-400"
              />
              <IconButton
                size="small"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => onRemoveItem(index)}
              >
                <CloseOutlined fontSize="small" />
              </IconButton>
            </div>
          );
        })}
      </FormGroup>
      <Button
        color="inherit"
        sx={{ color: 'text.secondary' }}
        startIcon={<AddOutlined />}
        size="small"
        onClick={() => onAddItem()}
      >
        Add option
      </Button>
    </div>
  );
}

export function TrueFalseAnswer() {
  return null;
}
