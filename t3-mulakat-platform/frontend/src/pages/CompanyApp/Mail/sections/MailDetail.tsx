import { useNavigate, useParams } from "react-router";
import MailDetailComp from "./MailDetailComp";

export function Component() {
    const { mailId, companySlug } = useParams()

    const navigate = useNavigate()

    return <MailDetailComp threadId={mailId} goBack={() => navigate(`/${companySlug}/mail`)} />
}

Component.displayName = 'MailDetail';