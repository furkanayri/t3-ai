import { useEffect, useState } from 'react';
import cn from "classnames";
import {
    Stack,
    Typography,
    Button,
    alpha,
    Skeleton,
} from '@mui/material';

import { ShowIfExist } from 'src/components';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetArchiveJobDetailQuery } from 'src/hooks/useServices';

export default function ArchiveJobPageHeader() {
    const { t, i18n } = useTranslation()
    const { id, companySlug } = useParams();
    const jobState = useGetArchiveJobDetailQuery({ id: id! });


    const dynamicLanguage = i18n.language;



    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{

                position: 'sticky',
                top: 0,
                paddingBlock: '1rem',
                backdropFilter: 'blur(6px)',
                backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
                zIndex: 1,

            }}
        >
            <div className="flex items-center gap-x-4">
                <div>
                    <div className='flex items-center gap-x-4 '>
                        <Typography
                            variant="h4"
                            component="div"
                        >
                            {jobState?.data?.job?.isLoading ? <Skeleton sx={{ minWidth: '40vw' }} /> : jobState?.data?.job?.title}
                        </Typography>
                    </div>
                    {jobState?.isLoading ? (
                        <div className="pt-2 flex items-center gap-x-2">
                            <Skeleton width={40} />
                            <Skeleton width={40} />
                            <Skeleton width={40} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-x-2 pt-2">
                            <div>{t(jobState?.data?.job?.jobType)}</div>
                            <div>•</div>
                            <div>{t(jobState?.data?.job?.locationType)}</div>
                            <div>•</div>
                            <div className="flex items-center gap-x-2">
                                {[jobState?.data?.job?.country?.names?.[dynamicLanguage], jobState?.data?.city, jobState?.data?.district].map(
                                    (location, ind) => (
                                        <ShowIfExist
                                            key={ind + location}
                                            render={(children) => <div>{children}</div>}
                                        >
                                            {location}
                                        </ShowIfExist>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Stack>
    );
}
