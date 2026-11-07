import { useMemo, useState, } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Autocomplete, Button, FormControl, IconButton, TextField, Tooltip, } from '@mui/material';
import { PostingChannel } from 'src/types';
import { useTranslation } from 'react-i18next';
import { SearchRemoveIcon } from 'hugeicons-react';
import { useAuth } from 'src/providers';

export default function JobFilters({ tenants, channels, isFetching }: { tenants: any[], channels: PostingChannel[], isFetching: boolean }) {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        _id: '',
        tenantId: '',
        title: '',
        channelId: '',
    })

    const selectedTenant = useMemo(() => {
        const foundTenant = tenants.find(tenant => tenant._id === filters?.tenantId)
        return foundTenant
    }, [filters, tenants, isFetching])

    const selectedChannel = useMemo(() => {
        const foundChannel = channels.find(channel => channel._id?.toString() === searchParams.get('channelId')?.toString())
        return foundChannel
    }, [searchParams, channels, isFetching])

    const { activeTenantId } = useAuth()
    const activeTab = useMemo(() => searchParams.get('activeTab'), [searchParams.get('activeTab')])

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
            prev.delete('tenantId')
            prev.delete('title')
            prev.delete('channelId')
            return prev
        })
        setFilters({
            _id: '',
            tenantId: '',
            title: '',
            channelId: '',
        })
    }
    const _id = searchParams.get("_id") ?? '';
    const tenantId = searchParams.get("tenantId") ?? '';
    const title = searchParams.get("title") ?? '';
    const channelId = searchParams.get("channelId") ?? '';
    const isFiltered = useMemo(() => {
        let filtered = false
        if (_id) filtered = true
        if (tenantId) filtered = true
        if (title) filtered = true
        if (channelId) filtered = true
        return filtered
    }, [tenantId, channelId, _id, title]);


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
                <FormControl variant='filled' >
                    <Autocomplete
                        fullWidth
                        disablePortal
                        options={
                            activeTab === "tenants" ? tenants?.filter(t => t?._id !== activeTenantId)
                                : activeTab === "admin" ? tenants?.filter(t => t?._id === activeTenantId)
                                    : tenants
                                    ?? []}
                        value={selectedTenant ?? null}
                        onChange={(event: any, value: any) => {
                            setFilters((prev) => {
                                if (!value)
                                    prev.tenantId = ''
                                else
                                    prev.tenantId = value?._id as string
                                prev.channelId = ''
                                return prev
                            })
                        }}
                        getOptionLabel={(opt) => opt.name}
                        renderInput={(params: any) =>
                            <TextField
                                {...params}
                                label={t("selectCompany")}
                                size='small'
                                InputLabelProps={{ shrink: true }}
                            />}
                        sx={{ width: 250 }}
                        disabled={isFetching || !tenants.length || activeTab === "admin"}
                    />
                </FormControl>
            </div>
            <div>
                <TextField
                    label={t("jobTitle")}
                    size='small'
                    value={filters.title}
                    onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
                    sx={{ width: 250 }}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <div>
                <Autocomplete
                    fullWidth
                    disablePortal
                    options={channels ?? []}
                    value={selectedChannel ?? null}
                    onChange={(event: any, value: any) => {
                        setSearchParams((prev) => {
                            if (!value)
                                prev.delete('channelId')
                            else
                                prev.set("channelId", value?._id as string)
                            return prev
                        })
                    }}
                    getOptionLabel={(opt) => opt.name}
                    renderInput={(params: any) =>
                        <TextField
                            {...params}
                            label={t("selectChannel")}
                            size='small'
                            InputLabelProps={{ shrink: true }}
                        />}
                    sx={{ width: 400 }}
                    disabled={isFetching || !channels.length}
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