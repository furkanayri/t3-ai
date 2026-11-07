import { useTranslation } from 'react-i18next';

export default function PageHeader() {
  const { t } = useTranslation();
  return (
    <div className='pb-[30px]'>
      <p className='font-satoshi font-medium text-[24px]  z-50'>
        {t('candidates')}
      </p>
    </div>
  );
}
