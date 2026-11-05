import { IconButton, Tooltip } from '@mui/material';
import { Comment01Icon } from 'hugeicons-react';
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CandidateCommentDrawer from 'src/pages/CompanyApp/Jobs/DetailJob/sections/JobOverview/sections/CandidateCommentDrawer'

function CreateComment() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();
    const isCommentOpen = searchParams.get('comment') !== null;
    return (
        <>
            {

                searchParams.get('comment') &&
                <CandidateCommentDrawer open={isCommentOpen} onClose={() => setSearchParams((prev: any) => {
                    prev.delete('comment')
                    return prev
                })} />
            }

        </>
    )
}

export default CreateComment