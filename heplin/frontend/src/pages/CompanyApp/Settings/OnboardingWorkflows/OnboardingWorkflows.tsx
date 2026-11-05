import { useState } from 'react';
import { CreateWorkflow, UpdateWorkflow, WorkflowPageHeader, WorkflowsHome } from './sections';

export default function OnboardingWorkflows() {
  const [state, setState] = useState<{ mode: 'list' | 'create' | 'update'; data: any }>({
    mode: 'list',
    data: null,
  });

  if (state.mode === 'list') {
    return (
      <WorkflowsHome
        openUpdate={(id) => setState({ mode: 'update', data: { id } })}
        openCreate={() => setState({ mode: 'create', data: null })}
      />
    );
  }

  if (state.mode === 'create') {
    return (<>
      <div className='w-full max-w-4xl pt-24'>
        <WorkflowPageHeader />
        <CreateWorkflow goBack={() => setState({ mode: 'list', data: null })} />
      </div>
    </>
    )
  }

  if (state.mode === 'update') {
    return <div className='w-full max-w-4xl pt-24'>
      <WorkflowPageHeader />
      <UpdateWorkflow id={state?.data?.id} goBack={() => setState({ mode: 'list', data: null })} />;
    </div>
  }

  return <></>;
}
