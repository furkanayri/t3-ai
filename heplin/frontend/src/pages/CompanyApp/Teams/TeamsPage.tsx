import { Seo } from "src/components/seo";
import { ListEmployees } from "./sections/Employees";
import { ProtectedRoute } from "src/components/Permission";

export function Component() {
    return (
        <ProtectedRoute permission="manage_departments" >
            <Seo title="Teams" />
            <div className='flex flex-col gap-[30px] pr-[55px] pb-[30px]'>
                <ListEmployees />
            </div>
        </ProtectedRoute>
    )
}

Component.displayName = 'TeamsPage';