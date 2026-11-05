import { Button, Tab, Tabs } from "@mui/material";
import { ChangeEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Paginate } from "src/components/shared";
import { useGetAllUsersQuery } from "src/hooks/useServices/admin";
import { UserDetailDialog, UserFilters, UserTable } from "./sections";
import { Add } from "@mui/icons-material";
import { RouterLink } from "src/components/router-link";

export function Component() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = useMemo(() => searchParams.get('activeTab') || 'active', [searchParams])

    const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
        setSearchParams(prev => {
            prev.set('activeTab', value)
            return prev
        })
    }

    const _id = searchParams.get("_id") ?? '';
    const name = searchParams.get("name") ?? '';
    const identificationNumber = searchParams.get("identificationNumber") ?? '';
    const email = searchParams.get("email") ?? '';

    const pageSizes = [12, 25, 50]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => {
        let str = `page=${page + 1}&limit=${limit}&status=${activeTab}`
        if (_id) str += `&_id=${_id}`
        if (name) str += `&name=${name}`
        if (email) str += `&email=${email}`
        if (identificationNumber) str += `&identificationNumber=${identificationNumber}`
        return str
    }, [page, limit, _id, name, identificationNumber, email, activeTab])

    const usersQuery = useGetAllUsersQuery(query)
    const users = useMemo(() => usersQuery?.data?.results, [usersQuery.data])

    return (
        <>
            <UserDetailDialog />
            <div className='sm:pr-[55px]'>
                <div className='flex justify-between'>
                    <p className="text-[24px] font-medium">
                        {t('users')}
                    </p>
                    <Button
                        LinkComponent={RouterLink}
                        href="create"
                        startIcon={
                            <Add />
                        }
                        variant="contained"
                    >
                        {t('newUser')}
                    </Button>
                </div>
                <Tabs
                    indicatorColor="primary"
                    onChange={handleTabsChange}
                    scrollButtons="auto"
                    textColor="primary"
                    value={activeTab}
                    variant="scrollable"
                >
                    {["active", "pending", "passive", "frozen", "deleted"].map((status) => (
                        <Tab
                            key={status}
                            label={t(status)}
                            value={status}
                        />
                    ))}
                </Tabs>
                <UserFilters />
                <Paginate
                    pageSizes={pageSizes}
                    count={usersQuery?.data?.count}
                    isFetching={usersQuery.isFetching}
                >
                    <UserTable users={users} />
                </Paginate>
            </div>
        </>
    )
}

Component.displayName = 'Users';