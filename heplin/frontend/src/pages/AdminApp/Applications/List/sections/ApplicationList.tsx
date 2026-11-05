import { Alert, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import { ProfileIcon, ViewIcon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IdInfoIcon } from 'src/components/shared';
import { useDisqualifyJobApplicationMutation } from 'src/hooks/useServices';

const ApplicantList = ({ applications, refetch }: { applications: any[], refetch: () => void }) => {
    const { t } = useTranslation();

    const navigate = useNavigate()
    const disqualifyMutation = useDisqualifyJobApplicationMutation()

    return (

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
                    {/* <TableCell width={100} >{t('gender')}</TableCell> */}
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
                                        {t('noApplicationsFound')}
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
                                    {/* <TableCell>{t(application.userId.gender)}</TableCell> */}
                                    <TableCell>
                                        {`${application?.candidateId?.name} ${application?.candidateId?.surname}`}
                                    </TableCell>
                                    <TableCell>{application?.userId?.identificationNumber}</TableCell>
                                    <TableCell>
                                        {application?.jobId?.title}
                                    </TableCell>
                                    <TableCell align='right'>
                                        <div className='flex items-center'>
                                            <Tooltip title={t('jobDetails')}>
                                                <IconButton onClick={() => navigate(`/jobs/${application?.jobId?._id}`)}>
                                                    <ViewIcon size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('applicants')}>
                                                <IconButton
                                                    onClick={() => navigate(`/jobs/${application?.jobId?._id}?activeTab=applications`)}
                                                >
                                                    <ProfileIcon size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            {/* <Tooltip title={application.status === 'disqualified' ? t('Disqualified') : t('applicant')}>
                                                <IconButton onClick={() => navigate(`/candidates?candidateId=${application?.candidateId?._id}`)}>
                                                    <UserIcon size={18} color={application?.status === 'disqualified' ? 'red' : ''} />
                                                </IconButton>
                                            </Tooltip>
                                            <ConfirmAction
                                                title={t('Disqualified')}
                                                description={t('Disqualify this application')}
                                                onConfirm={async () => handleDeleteApplicant(application?._id, application.candidateId, application?.jobId?._id)}
                                            >
                                                <Tooltip title={t('disqualify')}>
                                                    <IconButton disabled={application.status === 'disqualified'}>
                                                        <Delete02Icon size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </ConfirmAction> */}
                                        </div>

                                    </TableCell>
                                </TableRow>
                            )
                        })}

            </TableBody>
        </Table >

    )
}

export default ApplicantList