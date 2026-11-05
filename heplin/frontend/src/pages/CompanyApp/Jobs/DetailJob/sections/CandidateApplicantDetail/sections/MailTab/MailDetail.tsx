import MailDetailComp from "src/pages/CompanyApp/Mail/sections/MailDetailComp";

export default function MailDetail({ threadId, goBack }: { threadId?: string, goBack?: () => void }) {

    return <MailDetailComp threadId={threadId} goBack={goBack} />;
}