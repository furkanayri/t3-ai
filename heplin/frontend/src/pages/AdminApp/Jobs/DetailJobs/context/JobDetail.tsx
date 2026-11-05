import { createContext, useContext } from 'react';
import { useParams } from 'react-router';
import { useGetJobDetailQuery } from 'src/hooks/useServices/admin';

interface ContextValue {
    job: any,
    isLoading: boolean
    refetch: () => void,
}
const JobContext = createContext<ContextValue>({
    job: {},
    isLoading: false,
    refetch: () => { },
})

export default function JobDetailProvider({ children }: { children: any }) {
    const { id } = useParams()

    const jobDetailQuery = useGetJobDetailQuery({ jobId: id! })
    const job = jobDetailQuery?.data?.job

    return (
        <JobContext.Provider value={{
            job,
            isLoading: jobDetailQuery?.isLoading,
            refetch: jobDetailQuery.refetch,
        }}
        >
            {children}
        </JobContext.Provider>
    )
}

export const useJobDetail = () => {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error('useDrawer must be used within a CustomDrawer');
    }
    return context;
}