import { useRef, useCallback, useState, FormEvent } from 'react';
import { SearchOutlined } from '@mui/icons-material';
import { Box, InputAdornment, OutlinedInput, Stack, SvgIcon } from '@mui/material';

interface Filters {
  query?: string;
  status?: string;
}

export default function CandidatesListSearch() {
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState<Filters>({
    query: undefined,
    status: undefined,
  });

  const handleQueryChange = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const query = queryRef.current?.value || '';
    setFilters((prevState) => ({
      ...prevState,
      query,
    }));
  }, []);

  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={3}
      sx={{ p: 3 }}
    >
      <Box
        component="form"
        onSubmit={handleQueryChange}
        sx={{ flexGrow: 1 }}
      >
        <OutlinedInput
          defaultValue=""
          fullWidth
          inputProps={{ ref: queryRef }}
          name="title"
          placeholder="Search by fullname, email, phone"
          startAdornment={
            <InputAdornment position="start">
              <SvgIcon>
                <SearchOutlined />
              </SvgIcon>
            </InputAdornment>
          }
        />
      </Box>
      {/* <TextField
          label="Sort By"
          name="sort"
          onChange={handleSortChange}
          select
          SelectProps={{ native: true }}
          value={sortDir}
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </TextField> */}
    </Stack>
  );
}
