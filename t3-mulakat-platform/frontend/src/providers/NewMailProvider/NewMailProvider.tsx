import { createContext, useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllEmailTemplatesQuery } from "src/hooks/useServices/useEmailTemplateServices";
import { EmailTemplate } from "src/types";
import { array } from "src/utils";

type NewMailStateType = {
    initialTo?: string;
    lockToField?: boolean;
    onSendSuccess?: () => void;
}
type NewMailContextType = {
    openNewMail: (state?: NewMailStateType) => void;
    isOpenNewMail: boolean;
    closeNewMail: () => void;
    newMailState: NewMailStateType
    emailTemplates: any[]
}

const NewMailContext = createContext<NewMailContextType>({
    openNewMail: () => { },
    isOpenNewMail: false,
    closeNewMail: () => { },
    newMailState: {} as any,
    emailTemplates: []
})

export const useNewMail = () => {
    const context = useContext(NewMailContext);

    if (!context) throw new Error('useNewMail must be used within a NewMailProvider');

    return context
}

export function NewMailProvider({ children }: { children: React.ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const [newMailState, setNewMailState] = useState<NewMailStateType>({} as any)

    const emailTemplatesQuery = useGetAllEmailTemplatesQuery();
    const emailTemplates = useMemo(() => array<EmailTemplate>(emailTemplatesQuery?.data?.results), [emailTemplatesQuery.data])

    const isOpenNewMail = useMemo(() => searchParams.get('newMail') === "open", [searchParams]);
    const openNewMail = (state?: NewMailStateType) => {
        if (!!state) {
            setNewMailState(state)
        }

        setSearchParams(prev => {
            prev.set('newMail', 'open');
            return prev;
        });
    }

    const closeNewMail = () => {
        setNewMailState({} as any)
        setSearchParams(prev => {
            prev.delete('newMail');
            return prev;
        });
    }

    return (
        <NewMailContext.Provider value={{ openNewMail, isOpenNewMail, closeNewMail, newMailState, emailTemplates }}>
            {children}
        </NewMailContext.Provider>
    )
}