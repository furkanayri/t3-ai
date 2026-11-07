import { Card, CardHeader } from '@mui/material'
import React from 'react'
import Header from './component/Header'
import VideoInterview from './VideoInterview'

export default function VideoInterviewTab() {

    return (
        <div>
                <CardHeader
                    title={<Header />}
                />
                <VideoInterview />
        </div>
    )
}

