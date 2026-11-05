import { Clear } from '@mui/icons-material';
import {
  Box,
  Chip,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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

export function NumberExpectedAnswer({
  expectedAnswer,
  onChange,

}: {
  expectedAnswer: any;
  onChange: (val: any) => void;

}) {
  const { t } = useTranslation();
  return (

    <div className="py-4 px-4">
      <FormLabel>{t('ExpectedAnswer')}</FormLabel>
      <div className="flex items-center gap-x-2 mt-2">
        <TextField
          type="number"
          label="Min"
          size="small"
          value={expectedAnswer?.min ?? ''}
          onChange={(e) =>
            onChange({
              min: e.target.value === '' ? null : Number(e.target.value),
              max: expectedAnswer?.max ?? 0,
            })
          }
          sx={{ maxWidth: 200 }}
        />
        <TextField
          type="number"
          label="Max"
          size="small"
          value={expectedAnswer?.max ?? ''}
          onChange={(e) =>
            onChange({
              min: expectedAnswer?.min ?? 0,
              max: e.target.value === '' ? null : Number(e.target.value),
            })
          }
          sx={{ maxWidth: 200 }}
        />
      </div>
    </div>
  );
}

export function PriceExpectedAnswer({
  expectedAnswer,
  onChange,
}: {
  expectedAnswer: any;
  onChange: (val: any) => void;
}) {
  //TODO: add min, max validation rule
  //TODO: add price currenct formatting
  const { t } = useTranslation();
  return (

    <div className="py-4 px-4">
      <FormLabel>{t('ExpectedAnswer')}</FormLabel>
      <div className="flex items-center gap-x-2 mt-2">
        <TextField
          type="number"
          label="Min"
          size="small"
          sx={{ maxWidth: 200 }}
          value={expectedAnswer?.min ?? ''}
          onChange={(e) => onChange({ min: Number(e.target.value), max: expectedAnswer?.max ?? 0 })}
        />
        <TextField
          type="number"
          label="Max"
          size="small"
          sx={{ maxWidth: 200 }}
          value={expectedAnswer?.max ?? ''}
          onChange={(e) => onChange({ min: expectedAnswer?.min ?? 0, max: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}

export function SelectExpectedAnswer({
  options,
  expectedAnswer,
  onChange,
}: {
  options: string[];
  expectedAnswer: any;
  onChange: (val: any) => void;
}) {
  const expectedAnswers = array(expectedAnswer);
  const { t } = useTranslation();
  return (
    <div className="py-4 px-4">
      <FormLabel>{t('ExpectedAnswer')}</FormLabel>
      <div className="flex items-center gap-x-2 mt-2">
        <Select
          fullWidth
          multiple
          value={expectedAnswers}
          onChange={(e) =>
            onChange(
              typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
            )
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
          sx={{ maxWidth: '300px' }}
          endAdornment={
            expectedAnswers.length > 0 && (
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
          size={'small'}
          MenuProps={MenuProps}
        >
          {options.map((opt, ind) => (
            <MenuItem
              value={opt}
              key={opt + ind}
            >
              {opt}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function MultiSelectExpectedAnswer({
  options,
  expectedAnswer,
  onChange,
}: {
  options: string[];
  expectedAnswer: any;
  onChange: (val: any) => void;
}) {
  const expectedAnswers = array(expectedAnswer);
  const { t } = useTranslation();
  return (
    <div className="py-4 px-4">
      <FormLabel>{t('ExpectedAnswer')}</FormLabel>
      <div className="flex items-center gap-x-2 mt-2">
        <Select
          fullWidth
          multiple
          value={expectedAnswers}
          onChange={(e) =>
            onChange(
              typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
            )
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
            expectedAnswers.length > 0 && (
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
          sx={{ maxWidth: '300px' }}
          size={'small'}
          MenuProps={MenuProps}
        >
          {options.map((opt, ind) => (
            <MenuItem
              value={opt}
              key={opt + ind}
            >
              {opt}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function YesNoExpectedAnswer({
  expectedAnswer,
  onChange,
}: {
  expectedAnswer: any;
  onChange: (val: any) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="py-4 px-4">
      <FormLabel>{t('ExpectedAnswer')}</FormLabel>
      <div className="flex items-center gap-x-2 mt-2">
        <Select
          fullWidth
          sx={{ maxWidth: '300px' }}
          size={'small'}
          value={expectedAnswer ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {['true', 'false'].map((opt, ind) => (
            <MenuItem
              value={opt}
              key={opt + ind}
            >
              {t(opt)}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
