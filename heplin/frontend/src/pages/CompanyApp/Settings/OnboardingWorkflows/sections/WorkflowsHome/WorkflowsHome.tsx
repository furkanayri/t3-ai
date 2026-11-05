import { ListWorkflows } from './ListWorkflows';
import { WorkflowPageHeader } from '../WorkflowPageHeader';

export default function WorkflowsHome({
    openCreate,
    openUpdate,
}: {
    openCreate: () => void;
    openUpdate: (id: string) => void;
}) {

    return (
        <div className='w-full max-w-4xl pt-24'>
            <WorkflowPageHeader
                createButtonVisible={true}
                openCreate={openCreate}
            />
            <ListWorkflows
                openUpdate={openUpdate}
            />
        </div>
    );
}
