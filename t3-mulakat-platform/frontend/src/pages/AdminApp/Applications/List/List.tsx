import React, { useMemo, useState } from 'react'
import { ApplicationList, ApplicationSearch } from './sections';
import { useSearchParams } from 'react-router-dom';
import { useAdminGetAllApplicationsQuery } from 'src/hooks/useServices/admin';
import { Paginate } from 'src/components/shared';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { RouterLink } from 'src/components/router-link';
import SelectUserDialog from './sections/SelectUserDialog';

export function Component() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const [dialogState, setDialogState] = useState({ isOpen: false })
    const pageSizes = [5, 10, 20]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const applicantId = searchParams.get("applicantId") ?? '';
    const identificationNumber = searchParams.get("identificationNumber") ?? '';
    const jobName = searchParams.get("jobName") ?? '';
    const candidate = searchParams.get("candidate") ?? '';

    const query = useMemo(() => {
        let str = `page=${page + 1}&limit=${limit}&`
        if (applicantId) str += `applicantId=${applicantId}&`
        if (identificationNumber) str += `identificationNumber=${identificationNumber}&`
        if (jobName) str += `jobName=${jobName}&`
        if (candidate) str += `candidate=${candidate}`
        return str
    }, [
        applicantId,
        identificationNumber,
        jobName,
        candidate,
        page,
        limit
    ])

    const applicationsQuery = useAdminGetAllApplicationsQuery(query)
    const applications = useMemo(() => array(applicationsQuery?.data?.results), [applicationsQuery?.data?.results])

    return (
        <div className='pr-[55px] w-full overflow-x-scroll'>
            <div className='pb-[30px] flex justify-between items-center'>
                <p className='font-satoshi font-medium text-[24px]'>
                    {t('jobApplications')}
                </p>
                <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={() => setDialogState({ isOpen: true })}
                >
                    {t('newApplication')}
                </Button>
            </div>
            <SelectUserDialog
                open={dialogState.isOpen}
                handleClose={() => {
                    setDialogState({ isOpen: false })
                }}
            />
            <ApplicationSearch />
            <div
                className='py-[22px] rounded-[13px] mt-[20px] '
                style={{
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                }}
            >
                <Paginate
                    pageSizes={pageSizes}
                    count={applicationsQuery?.data?.count}
                    isFetching={applicationsQuery.isFetching}
                >

                    {
                        applicationsQuery.isFetching ? null :
                            < ApplicationList
                                applications={applications}
                                refetch={applicationsQuery.refetch}
                            />
                    }
                </Paginate>
            </div>
        </div >
    )
}

Component.displayName = 'Applicant';
