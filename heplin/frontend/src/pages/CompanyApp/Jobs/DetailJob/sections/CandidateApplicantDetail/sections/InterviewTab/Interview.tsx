import { Card, CardHeader } from '@mui/material'
import React from 'react'
import InterviewProcess from './component/InterviewProcess'
import Header from './component/Header'

export default function InterviewTab() {

    return (
        <div className='mt-4 space-y-2 mx-4'>
            <Card>
                <CardHeader
                    title={<Header />}
                />
            </Card>
            <InterviewProcess />
        </div>
    )
}

