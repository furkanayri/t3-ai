import React, { FC } from 'react';
import { OutlinedInput, InputAdornment, SvgIcon } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { he } from 'date-fns/locale';

interface CustomOutlinedInputProps {
    value: string | undefined;
    onChange: (value: string) => void;
    name: string;
    placeholder: string;
    height?: string;
}

const CustomOutlinedInput: FC<CustomOutlinedInputProps> = ({
    value,
    onChange,
    name,
    placeholder,
    height,
}) => {
    return (
        <OutlinedInput
            defaultValue=""
            fullWidth
            value={value}
            onChange={(e) => onChange(e.target.value)}
            name={name}
            placeholder={placeholder}
            startAdornment={
                <InputAdornment position="start">
                    <SvgIcon>
                        <SearchOutlined sx={{ color: '#ABAFB1' }} />
                    </SvgIcon>
                </InputAdornment>
            }

            sx={{
                flexGrow: 1,
                height: height || '40px',
                border: '1px solid #E31E24',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #E31E24',
                },
                '& .MuiOutlinedInput-input': {
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#ABAFB1',
                },
            }}
        />
    );
};

export default CustomOutlinedInput;
