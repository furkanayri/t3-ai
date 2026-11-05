import { Autocomplete, Button, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouterLink } from "src/components/router-link";
import { useGetAllUsersQuery } from "src/hooks/useServices/admin";
import { User } from "src/types/user";
import { array } from "src/utils";

export default function SelectUser() {
    const { t } = useTranslation();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const query = 'limit=500&page=1&status=active'
    const usersQuery = useGetAllUsersQuery(query)
    const users = useMemo(() => array<User>(usersQuery.data?.results), [usersQuery.data])
    const candidateUser = useMemo(() => users.find(user => user.isTenantMember === false), [users]);
    const handleChangeUser = (event: any, newValue: User | null) => {
        setSelectedUser(newValue ? newValue : null)
    }

    return (
        <div className="flex items-center flex-col gap-4">
            <p className="font-medium text-xl">{t("selectUserToCreateJobApplication")}</p>
            <Autocomplete
                noOptionsText={t("noUsersFound")}
                options={candidateUser ? [candidateUser] : []}
                value={selectedUser}
                getOptionLabel={(opt) => opt?.name + " " + opt?.surname}
                onChange={handleChangeUser}
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        label={t("selectUser")}
                    />
                )}
                sx={{ width: "50%" }}
            />
            <Button
                variant="contained"
                LinkComponent={RouterLink}
                href={`create/${selectedUser?._id}` ?? "#"}
                disabled={!selectedUser}
            >
                {t("next")}
            </Button>
        </div>
    )
}

