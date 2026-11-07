import { Avatar, Dialog, DialogContent } from "@mui/material"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useGetUserQuery } from "src/hooks/useServices/admin"
import { convertPublicFileURL } from "src/utils"

export default function UserDetailDialog() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { t } = useTranslation()

    const userId = searchParams.get('userId')
    const userDetailQuery = useGetUserQuery(userId ?? "")
    const user = useMemo(() => userDetailQuery?.data?.user, [userDetailQuery.data])


    return (
        <Dialog
            open={!!userId}
            onClose={() => setSearchParams(prev => {
                prev.delete('userId')
                return prev
            })}
            maxWidth="md"
        >
            <DialogContent className="space-y-4">
                <div className="flex gap-4">
                    <Avatar
                        sx={{ textTransform: 'uppercase' }}
                        src={convertPublicFileURL(user?.avatar)}
                    >
                        {user?.name?.[0]}
                        {user?.surname?.[0]}
                    </Avatar>
                    <div>
                        <p className="font-medium text-xl leading-5">
                            {
                                !!user?.name && !!user?.surname ?
                                    `${user?.name} ${user?.surname}` : `**${t("notRegistered")}`
                            }
                        </p>
                        <p>{user?.email}</p>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div>
                        <p>{t("phone")}:</p>
                        <p>{t("status")}:</p>
                        <p>{t("identificationNumber")}:</p>
                        <p>{t("gender")}:</p>
                        <p>{t("maritalStatus")}:</p>
                        <p>{t("militaryStatus")}:</p>
                        <p>{t("address")}:</p>
                    </div>
                    <div className="font-medium">
                        <p>{!!user?.phone ? user?.phone : "-"}</p>
                        <p>{t(user?.status) ?? "-"}</p>
                        <p>{!!user?.identificationNumber ? user?.identificationNumber : "-"}</p>
                        <p>{!!user?.gender ? t(user?.gender) : "-"}</p>
                        <p>{!!user?.maritalStatus ? t(user?.maritalStatus) : "-"}</p>
                        <p>{!!user?.militaryStatus ? t(user?.militaryStatus) : "-"}</p>
                        <p >{!!user?.address ? user?.address : "-"}</p>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}
