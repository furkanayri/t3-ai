import {
    Autocomplete,
    Box,
    TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetAllTenantsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from 'src/providers';

const CandidateSearch = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const { activeTenant } = useAuth()
    const tenantsQuery = useGetAllTenantsQuery()
    const tenantsData = array<any>(tenantsQuery.data?.results);
    const isParentTenant = tenantsData.filter(tenant => !!tenant?.parentTenantId)

    const newVal = [...isParentTenant, activeTenant]
    return (
        <div className='flex gap-2' >
            <div className='min-w-min'>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={newVal}
                    getOptionLabel={(option) => option?.name}
                    sx={{ width: 300 }}
                    onChange={(event, newValue) => {
                        setSearchParams((prev) => {
                            if (!!newValue)
                                prev.set('subtenant', newValue?._id);
                            else
                                prev.delete('subtenant')
                            return prev;
                        })
                    }}
                    renderInput={(params) => <TextField
                        {...params}
                        label={t("Company")}
                        size='small'
                    />}
                />
            </div>
        </div>
    )
}

export default CandidateSearch