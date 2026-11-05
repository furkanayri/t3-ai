import type { FC, RefAttributes } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { RouterLink } from 'src/components/router-link';
import { Loader } from 'src/components/shared';
import { useTranslation } from 'react-i18next';
import { HugeiconsProps } from 'hugeicons-react';

interface ICardProps {
    amount: number;
    title: string;
    href: string;
    color?: string;
    loading: boolean;
    icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>
}

export const DashboardCountCard: FC<ICardProps> = (props) => {
    const { t } = useTranslation();
    const { amount, color, loading, title, href, icon } = props;
    const Icon = icon

    return (
        <Box
            component={RouterLink}
            href={href}
            className='min-w-[300px] p-[22px] rounded-[13px] flex gap-[35px] items-center'
            style={{
                boxShadow: "0px 4px 14.8px 0px #A6A6A640"
            }}
        >
            <div
                style={{ backgroundColor: color ? color + '20' : '#E31E24' + '20' }}
                className={`bg-[#E31E24] w-[95px] h-[95px] rounded-[5px] flex justify-center items-center`}
            >
                <Icon color={color ? color : '#E31E24'} size={50} />
            </div>
            <Box className='pr-[30px]'>
                <Loader isLoading={loading}>
                    <p className='text-[20px] font-medium leading-7'>
                        {title}
                    </p>
                </Loader>
                <Loader isLoading={loading}>
                    <p className='text-[30px] font-medium leading-10 text-center'>
                        {amount}
                    </p>
                </Loader>
            </Box>
        </Box>
    );
};

DashboardCountCard.propTypes = {
    amount: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
};
