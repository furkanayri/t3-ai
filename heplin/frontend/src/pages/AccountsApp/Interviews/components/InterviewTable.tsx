import { Tab, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { useTranslation } from "react-i18next";
import { SeverityPill } from "src/components/severity-pill";

const InterviewTable = ({ handleClick, interviewsList }: { interviewsList: any, handleClick: any }) => {
    const { t } = useTranslation();

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell width={500}>{t('interviewName')}</TableCell>
                    <TableCell >{t('status')}</TableCell>
                    <TableCell align="right">{t('lastDate')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    interviewsList.length === 0 ? <TableRow>
                        <TableCell colSpan={3}> {t('NoInterviewFound')} </TableCell>
                    </TableRow> :
                        interviewsList?.map((interview: any) => {
                            return (
                                <TableRow
                                    className={`${interview.accessLocked ? ' bg-slate-100' : 'group cursor-pointer'}`}
                                    onClick={() => handleClick(interview)}
                                    key={interview?._id}>
                                    <TableCell width={500} >
                                        <Typography className="group-hover:underline" variant="subtitle1" >
                                            {interview?.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell >
                                        <SeverityPill>
                                            {t(interview?.status)}
                                        </SeverityPill> </TableCell>
                                    <TableCell align="right">
                                        {new Date(interview?.expirationDate).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                }
            </TableBody>
        </Table>
    )
}

export default InterviewTable