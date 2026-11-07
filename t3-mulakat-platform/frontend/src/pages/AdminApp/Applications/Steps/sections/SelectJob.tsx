import { Autocomplete, Button, CircularProgress, TextField } from "@mui/material"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useGetAllTenantsQuery } from "src/hooks/useServices"
import { useGetAllJobsOfAdminTenant } from "src/hooks/useServices/admin"
import { Tenant } from "src/types"
import { JobPost } from "src/types/jobPost"
import { array } from "src/utils"

export default function SelectJob() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()

    const tenantsQuery = useGetAllTenantsQuery("page=1&limit=100")
    const tenants = useMemo(() => array<Tenant>(tenantsQuery.data?.results), [tenantsQuery.data])

    const tenantId = useMemo(() => searchParams.get("tenantId") ?? "", [searchParams])
    const jobId = useMemo(() => searchParams.get("jobId") ?? "", [searchParams])
    const userId = useMemo(() => searchParams.get("userId") ?? "", [searchParams])

    const query = useMemo(() => {
        return tenantId ? `tenantId=${tenantId}&status=published&page=1&limit=100` : ""
    }, [tenantId])
    const jobsQuery = useGetAllJobsOfAdminTenant(query, !!tenantId)
    const jobs = useMemo(() => array<JobPost>(jobsQuery.data?.results), [jobsQuery.data])

    const handleChangeTenant = (event: any, newValue: Tenant | null) => {
        setSearchParams(prev => {
            prev.has("jobId") && prev.delete("jobId")
            if (!newValue) {
                prev.has("tenantId") && prev.delete("tenantId")
                return prev
            }
            prev.set("tenantId", newValue._id as string)
            return prev
        })
    }

    const handleChangeJob = (event: any, newValue: JobPost | null) => {
        setSearchParams(prev => {
            if (!newValue) {
                prev.has("jobId") && prev.delete("jobId")
                return prev
            }
            prev.set("jobId", newValue._id as string)
            return prev
        })
    }

    const handleNext = () => {
        setSearchParams(prev => {
            prev.set("activeStep", "1")
            return prev
        })
    }


    return (
        <>
            <div className="flex flex-col gap-8 mb-4 items-center w-full min-h-[50vh]">
                {
                    tenantsQuery.isFetching ? <CircularProgress /> :
                        <Autocomplete
                            noOptionsText={t("noTenantsFound")}
                            options={tenants ?? []}
                            value={tenants.find(t => t._id === tenantId) ?? null}
                            getOptionLabel={(opt) => opt?.name}
                            onChange={handleChangeTenant}
                            renderInput={(params: any) => (
                                <TextField
                                    {...params}
                                    label={t("selectTenant")}
                                />
                            )}
                            sx={{ width: "50%" }}
                        />
                }
                {
                    !tenantId ? null :
                        jobsQuery.isFetching ? <CircularProgress /> :
                            <Autocomplete
                                noOptionsText={t("noJobsFound")}
                                options={jobs ?? []}
                                value={jobs.find(j => j._id === jobId) ?? null}
                                getOptionLabel={(opt) => opt?.title}
                                onChange={handleChangeJob}
                                renderInput={(params: any) => (
                                    <TextField
                                        {...params}
                                        label={t("selectJob")}
                                    />
                                )}
                                disabled={!tenantId || jobsQuery.isFetching}
                                sx={{ width: "50%" }}
                            />
                }
            </div>
            <div className="flex justify-end">
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!jobId}
                >
                    {t('next')}
                </Button>
            </div>
        </>
    )
}
