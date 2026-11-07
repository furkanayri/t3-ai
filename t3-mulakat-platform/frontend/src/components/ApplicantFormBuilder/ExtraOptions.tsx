import { MenuItem, Select } from '@mui/material';

export function PriceExtraOptions({
  options,
  onChange,
}: {
  options: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div>
      <Select
        value={options?.currency ?? 'USD'}
        onChange={(e) => {
          onChange('currency', e.target.value);
        }}
        sx={{ width: '160px' }}
        size={'small'}
      >
        {[
          { code: 'USD', symbolText: '$' },
          { code: 'EUR', symbolText: '€' },
          { code: 'TRY', symbolText: '₺' },
        ].map((formType) => (
          <MenuItem
            value={formType.code}
            key={formType.code}
          >
            {formType.code} ({formType.symbolText})
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
