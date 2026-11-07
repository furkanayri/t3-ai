import { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { ApplicantLocations } from './sections/JobReports';
import ComingSoon from 'src/components/shared/ComingSoon';

type OverviewCardProps = {
  title: ReactNode;
  count: ReactNode;
};

function OverviewCard({ title, count }: OverviewCardProps) {
  const getGradientByTitle = (title: ReactNode) => {
    const titleStr = String(title);
    if (titleStr.includes('Görüntülenme')) return 'from-blue-500 to-blue-600';
    if (titleStr.includes('Başvuru')) return 'from-green-500 to-green-600';
    if (titleStr.includes('Dönüşüm')) return 'from-purple-500 to-purple-600';
    return 'from-gray-500 to-gray-600';
  };

  const getIconByTitle = (title: ReactNode) => {
    const titleStr = String(title);
    if (titleStr.includes('Görüntülenme')) return '👁️';
    if (titleStr.includes('Başvuru')) return '📝';
    if (titleStr.includes('Dönüşüm')) return '📊';
    return '📌';
  };

  return (
    <Card className="relative hover:scale-105 transition-all duration-300 border border-gray-100 shadow-lg rounded-[20px]">
      <Stack
        alignItems="center"
        direction="column"
        spacing={2}
        sx={{
          px: 4,
          py: 4,
        }}
      >
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradientByTitle(title)} flex items-center justify-center mb-2 shadow-lg`}>
          <span className="text-2xl">{getIconByTitle(title)}</span>
        </div>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            {title}
          </Typography>
          <Typography
            color="text.primary"
            variant="h4"
            sx={{ fontWeight: 700, mt: 1 }}
          >
            {count}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

//TODO: sorulan sorulara göre cevapların gruplandığı bir raporlama bölümü eklenebilir?
export function Component() {
  return (
    <>
      <div className="grid grid-cols-3 items-center gap-x-4">
        {/* <ComingSoon /> */}

        <OverviewCard
          title={'Görüntülenme'}
          count={220}
        />
        <OverviewCard
          title={'Burs Başvurusu'}
          count={100}
        />
        <OverviewCard
          title={'Dönüşüm Oranı'}
          count={`${((100 / 220) * 100).toFixed(2)}%`}
        />
      </div>
      <ApplicantLocations />
    </>
  );
}

Component.displayName = 'JobReports';
