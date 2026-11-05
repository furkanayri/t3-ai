import { Button, FormControl, IconButton, MenuItem, TextField, Tooltip } from '@mui/material'
import { SearchRemoveIcon } from 'hugeicons-react';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const ApplicationSearch = () => {
    // gender,tc,jobId
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState({
        identificationNumber: '',
        applicantId: '',
        jobName: '',
        candidate: ""
    })
    const { t } = useTranslation();
    const applicantId = searchParams.get("applicantId") ?? '';
    const identificationNumber = searchParams.get("identificationNumber") ?? '';
    const jobName = searchParams.get("jobName") ?? '';
    const candidate = searchParams.get("candidate") ?? '';


    const handleFilter = () => {
        setSearchParams(prev => {
            Object.entries(filters).forEach(([key, value]) => {
                if (!value) prev.delete(key)
                else prev.set(key, value)
            })
            return prev
        })
    }
    const handleDeleteFilter = () => {
        setSearchParams((prev) => {
            prev.delete('applicantId')
            prev.delete('identificationNumber')
            prev.delete('jobName')
            prev.delete('candidate')
            return prev
        }
        )

        setFilters({
            identificationNumber: '',
            applicantId: '',
            jobName: '',
            candidate: ""
        })
    }


    return (
        <div>
            <FormControl variant='filled'>
                <div className='flex items-center gap-1'>
                    <TextField
                        label={t('id')}
                        sx={{ width: 80 }}
                        value={filters.applicantId}
                        size='small'
                        onChange={e => setFilters((prev) => ({ ...prev, applicantId: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleFilter();
                            }
                        }}
                    />
                    {/* TODO: Add gender back if necessary */}
                    {/* <TextField
                        label={t('gender')}
                        name="gender"
                        size='small'
                        onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value }))}
                        value={filters.gender}
                        select
                        sx={{ flexGrow: 1, width: 100 }}
                        fullWidth
                    >
                        {gender.map((item) => (
                            <MenuItem
                                key={item.value}
                                value={item.value}
                            >

                                {t(item.label)}
                            </MenuItem>
                        ))}
                    </TextField> */}

                    <TextField
                        onChange={e => setFilters((prev) => ({ ...prev, candidate: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleFilter();
                            }
                        }}
                        value={filters.candidate}
                        size='small'
                        label={t('candidate')}
                        sx={{ width: 300 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        onChange={e => setFilters((prev) => ({ ...prev, identificationNumber: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleFilter();
                            }
                        }}
                        value={filters.identificationNumber}
                        size='small'
                        label={t('identificationNumber')}
                        sx={{ width: 300 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        onChange={e => setFilters((prev) => ({ ...prev, jobName: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleFilter();
                            }
                        }}
                        value={filters.jobName}
                        size='small'
                        label={t('jobPostName')}
                        sx={{ width: 300 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button
                        onClick={handleFilter}
                        variant='outlined'
                        sx={{ height: 37 }}
                    >
                        {t('filter')}
                    </Button>
                    {
                        (applicantId ||
                            identificationNumber ||
                            jobName ||
                            candidate) &&
                        <Tooltip title={t('resetFilters')} >
                            <IconButton
                                onClick={handleDeleteFilter}
                                color='primary'
                            >
                                <SearchRemoveIcon size={18} />
                            </IconButton>
                        </Tooltip>
                    }
                </div>

            </FormControl>
        </div >
    )
}

export default ApplicationSearch