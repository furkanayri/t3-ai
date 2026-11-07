import { Tab, Tabs } from '@mui/material';
import AuthLayout from '../AuthLayout';
import { CompanyRegister, UserRegister } from './component';
import { Fragment, Suspense, lazy, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAccountsApp, isCompanyApp } from "src/utils";




export function Component() {
    const [searchParams, setSearchParams] = useSearchParams();
    const isAccounts = isAccountsApp()
    const isCompany = isCompanyApp()

    return (
        <AuthLayout>
            <Suspense fallback={<div>Loading...</div>}>
                {isCompany && (<CompanyRegister />)}
                {isAccounts && (<UserRegister />)}
            </Suspense>

        </AuthLayout>
    )
}
Component.displayName = 'CompanyRegister';