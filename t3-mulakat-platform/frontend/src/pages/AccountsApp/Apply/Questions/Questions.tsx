import { Clear } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApplicantFormItem } from 'src/types/jobPost';
import { array } from 'src/utils';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function convertBoolean(data: any) {
  if (typeof data === 'boolean') return data;

  if (data === 'true') return true;

  if (data === 'false') return false;

  return null;
}

type AnswerProps = {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  options?: any;
  error?: string | null;
};
function TextfieldAnswer({ value, onChange, onBlur, error }: AnswerProps) {
  return (
    <>
      <OutlinedInput
        value={value ?? ''}
        fullWidth
        onBlur={() => onBlur()}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
      />
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

function MultilinefieldAnswer({ value, onChange, onBlur, error }: AnswerProps) {
  return (
    <>
      <OutlinedInput
        value={value ?? ''}
        multiline
        fullWidth
        minRows={2}
        onBlur={() => onBlur()}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
      />
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

function NumberfieldAnswer({ value, onChange, onBlur, error }: AnswerProps) {
  return (
    <>
      <OutlinedInput
        sx={{ minWidth: 275 }}
        value={value ?? ''}
        inputMode="numeric"
        type="number"
        error={!!error}
        onBlur={() => onBlur()}
        onChange={(e) => {
          const _val = e.target.value;

          onChange(_val === '' ? null : +_val);
        }}
      />
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

function PricefieldAnswer({ value, onChange, options, onBlur, error }: AnswerProps) {
  return (
    <>
      <OutlinedInput
        sx={{ minWidth: 275 }}
        value={value ?? ''}
        onBlur={() => onBlur()}
        onChange={(e) => {
          const _val = e.target.value;

          onChange(_val === '' ? null : +_val);
        }}
        error={!!error}
        inputMode="numeric"
        type="number"
        startAdornment={<InputAdornment position="start">{options?.currency}</InputAdornment>}
      />
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

function TrueFalseAnswer({ value, onChange, onBlur, error }: AnswerProps) {
  return (
    <>
      <RadioGroup
        row
        onBlur={() => onBlur()}
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={(e) => {
          onChange(convertBoolean(e.target.value));
        }}
        value={value?.toString()}
      >
        <FormControlLabel
          value={true}
          control={<Radio />}
          label="Yes"
        />
        <FormControlLabel
          value={false}
          control={<Radio />}
          label="No"
        />
      </RadioGroup>
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

function ChoiceAnswer({ value, onChange, options, onBlur, error }: AnswerProps) {
  const items = array(options?.items).filter((opt) => typeof opt === 'string');
  return (
    <>
      <Select
        error={!!error}
        onBlur={() => onBlur()}
        value={value ?? null}
        onChange={(e) => {
          onChange(e.target.value ?? null);
        }}
        sx={{ minWidth: 250, width: '50vw' }}
      >
        {items.map((item: any, ind) => {
          return (
            <MenuItem
              key={ind}
              value={item}
            >
              {item}
            </MenuItem>
          );
        })}
      </Select>
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

function MultiChoiceAnswer({ value, onChange, options, onBlur, error }: AnswerProps) {
  const items = array(options?.items).filter((opt) => typeof opt === 'string');
  return (
    <>
      <Select
        error={!!error}
        onBlur={() => onBlur()}
        onChange={(e) =>
          onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
        }
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {array<any>(selected).map((value) => (
              <Chip
                key={value}
                label={value}
              />
            ))}
          </Box>
        )}
        endAdornment={
          value.length > 0 && (
            <InputAdornment
              sx={{ mr: 1 }}
              position="end"
            >
              <IconButton
                size="small"
                onClick={() => onChange([])}
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          )
        }
        MenuProps={MenuProps}
        value={array(value)}
        multiple
        sx={{ minWidth: 250, width: '50vw' }}
      >
        {items.map((item: any, ind) => {
          return (
            <MenuItem
              key={ind}
              value={item}
            >
              {item}
            </MenuItem>
          );
        })}
      </Select>
      {!!error && <FormHelperText error>{error?.toString()}</FormHelperText>}
    </>
  );
}

const AnswerFieldMapper = {
  text: TextfieldAnswer,
  multiline: MultilinefieldAnswer,
  number: NumberfieldAnswer,
  price: PricefieldAnswer,
  trueFalse: TrueFalseAnswer,
  choice: ChoiceAnswer,
  'multiple-choices': MultiChoiceAnswer,
};

export default function Questions({
  questions,
  setAnswer,
  onBlur,
  errors,
  touched,
}: {
  setAnswer: (value: any, index: number) => void;
  questions: Array<{ questionId: string; answer?: any; question: ApplicantFormItem }>;
  onBlur: (ind: number) => void;
  errors: Array<any>;
  touched: Array<any>;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader title={t("Questions")}></CardHeader>
      <CardContent className=" !mt-0 !pt-0 space-y-8">
        {questions?.length === 0 && ( 
          <Typography>{t("No questions available")}</Typography>
        )}
        {questions.map((item, ind) => {
          const AnswerField =
            AnswerFieldMapper[item.question.type as keyof typeof AnswerFieldMapper] ?? Fragment;
          return (
            <div key={ind}>
              <Typography sx={{ mb: 1 }}>
                {ind + 1}. {item.question?.title} {item?.question?.options?.isRequired ? '*' : null}
              </Typography>
              <AnswerField
                onBlur={() => {
                  onBlur(ind);
                }}
                error={!!touched?.[ind] && errors?.[ind]}
                value={item.answer ?? ''}
                onChange={(value) => setAnswer(value, ind)}
                options={item.question?.options}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
