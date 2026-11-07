import { Button, IconButton, TextField, Tooltip } from "@mui/material";
import { SearchRemoveIcon } from "hugeicons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export default function ApplicationFilters() {
    const { t } = useTranslation()
    const [filters, setFilters] = useState({
        _id: '',
        name: '',
        identificationNumber: '',
    })
    const [searchParams, setSearchParams] = useSearchParams();


    const handleFilter = () => {
        setSearchParams(prev => {
            Object.entries(filters).forEach(([key, value]) => {
                if (!value) prev.delete(key)
                else prev.set(key, value)
            })
            return prev
        })
    }
    const handleResetFilter = () => {
        setSearchParams(prev => {
            prev.delete('_id')
            prev.delete('name')
            prev.delete('identificationNumber')
            return prev
        })
        setFilters({
            _id: '',
            name: '',
            identificationNumber: '',
        })
    }

    const _id = searchParams.get("_id") ?? '';
    const name = searchParams.get("name") ?? '';
    const identificationNumber = searchParams.get("identificationNumber") ?? '';
    const isFiltered = useMemo(() => {
        let filtered = false
        if (_id) filtered = true
        if (name) filtered = true
        if (identificationNumber) filtered = true
        return filtered
    }, [name, _id, identificationNumber]);

    return (
        <div className='flex gap-1 my-5 items-center'>
            <div>
                <TextField
                    label={t("id")}
                    size='small'
                    value={filters._id}
                    onChange={(e) => setFilters((prev) => ({ ...prev, _id: e.target.value }))}
                    sx={{ width: 80 }}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <div>
                <TextField
                    label={t("name")}
                    size='small'
                    value={filters.name}
                    onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                    sx={{ width: 300 }}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <div>
                <TextField
                    label={t("identificationNumber")}
                    size='small'
                    value={filters.identificationNumber}
                    onChange={(e) => setFilters((prev) => ({ ...prev, identificationNumber: e.target.value }))}
                    sx={{ width: 300 }}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <div>
                <Button
                    onClick={handleFilter}
                    variant='outlined'
                    sx={{ height: 37 }}
                >
                    {t('filter')}
                </Button>
                {isFiltered &&
                    <Tooltip title={t('resetFilters')} >
                        <IconButton
                            onClick={handleResetFilter}
                            color='primary'
                        >
                            <SearchRemoveIcon size={18} />
                        </IconButton>
                    </Tooltip>
                }
            </div>
        </div>
    )
}
