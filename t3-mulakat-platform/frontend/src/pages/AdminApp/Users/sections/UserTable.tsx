import { Alert, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { Edit02Icon, ProfileIcon, ViewIcon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { IdInfoIcon } from "src/components/shared";

export default function UserTable({ users }: { users: any[] }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
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
                    <TableCell width={300}>{t('name_surname')}</TableCell>
                    <TableCell width={240}>{t('email')}</TableCell>
                    <TableCell width={240}>{t('identificationNumber')}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    users?.length === 0 ?
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Alert severity='info'>
                                    <Typography variant='body2'>
                                        {t('userNotFound')}
                                    </Typography>
                                </Alert>
                            </TableCell>
                        </TableRow>
                        :
                        users?.map((user: any) => {
                            return (
                                <TableRow key={user?._id}>
                                    <TableCell>
                                        <IdInfoIcon id={user?._id} />
                                    </TableCell>
                                    <TableCell>
                                        {
                                            !user?.name && !user?.surname ?
                                                "**" + t("notRegistered")
                                                :
                                                `${user?.name} ${user?.surname}`
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {user?.email ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {user?.identificationNumber ?? "-"}
                                    </TableCell>
                                    <TableCell align='right'>
                                        <Tooltip title={t('details')}>
                                            <IconButton onClick={() => {
                                                setSearchParams(prev => {
                                                    prev.set('userId', user._id)
                                                    return prev
                                                })
                                            }}>
                                                <ProfileIcon size={18} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('edit')}>
                                            <IconButton onClick={() => navigate(`${user._id}/edit`)}>
                                                <Edit02Icon size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
            </TableBody>
        </Table>
    )
}
