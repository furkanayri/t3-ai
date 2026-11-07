import { Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, FC, Suspense, useCallback, useMemo } from 'react';
import { usePageView } from 'src/hooks/use-page-view';
import { CompanyTab, TenantsTab } from './sections';
import { useResendInviteTenantMemberMutation, useRevokeTenantMemberMutation, useChangeTeamMemberStatusMutation } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';

const tabs = [
  { label: 'Admin Members', value: 'admin-members', onClick: () => { } },
  { label: 'Tenants Members', value: 'tenants-members', onClick: () => { } },
];

export const Component: FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTenantId } = useAuth()

  const activeTab = useMemo(() => searchParams.get('activeTab') || 'admin-members', [searchParams])

  const rovekeInvite = useRevokeTenantMemberMutation()
  const inviteResend = useResendInviteTenantMemberMutation()
  const changeStatusMutation = useChangeTeamMemberStatusMutation()

  usePageView();
  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setSearchParams(prev => {
      if (value === 'admin-members') {
        prev.set('tenantId', activeTenantId ?? '')
      }
      prev.delete('memberId')
      prev.set('activeTab', value)
      return prev
    })
  }, []);

  return (
    <>
      <div className='sm:pr-[55px] overflow-x-scroll'>
        <div className='pb-[30px]'>
          <p className='font-satoshi font-medium text-[24px]  z-50'>
            {t('systemMembers')}
          </p>
        </div>
        {/* <Button variant="contained">Add new user</Button> */}
        <Tabs
          indicatorColor="primary"
          onChange={handleTabsChange}
          scrollButtons="auto"
          textColor="primary"
          value={activeTab}
          variant="scrollable"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={t(tab.label)}
              value={tab.value}
            />
          ))}
        </Tabs>
        <Suspense>
          {activeTab === 'admin-members' && <CompanyTab state={{ rovekeInvite, inviteResend, changeStatusMutation }} />}
          {activeTab === 'tenants-members' && <TenantsTab state={{ rovekeInvite, inviteResend, changeStatusMutation }} />}
        </Suspense>
      </div>
    </>
  );
}

Component.displayName = 'UsersList';
