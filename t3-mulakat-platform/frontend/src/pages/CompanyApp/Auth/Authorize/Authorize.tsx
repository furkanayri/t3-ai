import { enqueueSnackbar } from "notistack"
import { useSearchParams } from "react-router-dom"
import { useAuthorizeClientQuery } from "src/hooks/useServices"
import { appPath } from "src/utils"

export function Component() {
    const [searchParams, setSearchParams] = useSearchParams()

    const contunie = searchParams.get("continue")
    useAuthorizeClientQuery({
        redirect_uri: contunie ?? "",
        onSuccess: (data) => {
            window.location.replace(`${data?.contunie}?code=${data?.code}&state=${data?.state}`)
        },
        onError: (error) => {
            enqueueSnackbar(error.message, { variant: "error" });

            setTimeout(() => {
                window.location.replace(appPath("/"))
            }, 2000);
        }
    })
    return null
}

Component.displayName = "Authorize"