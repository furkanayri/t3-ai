import { array } from "src/utils"
import { Alert, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router"
import { ViewIcon } from "hugeicons-react"
import { useSnackbar } from "notistack"
import { IdInfoIcon, Paginate } from "src/components/shared"
import { useGetJobApplicationsOfJobQuery } from "src/hooks/useServices/admin"
import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import ApplicationFilters from "./ApplicationFilters"

export default function JobApplications() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const [searchParams, setSearchParams] = useSearchParams()

    const _id = searchParams.get("_id") ?? '';
    const name = searchParams.get("name") ?? '';
    const identificationNumber = searchParams.get("identificationNumber") ?? '';

    const pageSizes = [12, 24, 48]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => {
        let str = `page=${page + 1}&limit=${limit}`
        if (_id) str += `&_id=${_id}`
        if (name) str += `&name=${name}`
        if (identificationNumber) str += `&identificationNumber=${identificationNumber}`
        return str
    }, [page, limit, _id, name, identificationNumber])

    const applicationsQuery = useGetJobApplicationsOfJobQuery({ jobId: id!, query })
    const applications = array(applicationsQuery?.data?.results)

    return (
        <>
            <ApplicationFilters />
            <Paginate
                pageSizes={pageSizes}
                count={applicationsQuery?.data?.count}
                isFetching={applicationsQuery.isFetching}
            >
                {applicationsQuery.isFetching ? null :
                    <div>
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        "& .MuiTableCell-root": {
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            fontFamily: "Satoshi, sans-serif",
                                            textTransform: "capitalize",
                                        }
                                    }}
                                >
                                    <TableCell width={80} align='center'>#</TableCell>
                                    <TableCell width={300}>{t('candidate')}</TableCell>
                                    <TableCell width={300}>{t('identificationNumber')}</TableCell>
                                    <TableCell width={300}>{t('jobTitle')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    applications?.length === 0 ?
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Alert severity='info'>
                                                    <Typography variant='body2'>
                                                        {t('thereAreNoApplicationsYet')}
                                                    </Typography>
                                                </Alert>
                                            </TableCell>
                                        </TableRow>
                                        :
                                        applications?.map((application: any) => {
                                            return (
                                                <TableRow key={application?._id}>
                                                    <TableCell>
                                                        <IdInfoIcon id={application?._id} />
                                                    </TableCell>
                                                    <TableCell>
                                                        {`${application?.candidateId?.name} ${application?.candidateId?.surname}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {application?.userId?.identificationNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {application?.jobId?.title}
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Tooltip title={t('jobDetails')}>
                                                            <IconButton onClick={() => navigate(`/jobs/${application?.jobId?._id}`)}>
                                                                <ViewIcon size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                            </TableBody>
                        </Table >
                    </div>
                }
            </Paginate>
        </>
    )
}

