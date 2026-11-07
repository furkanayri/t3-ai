import React from 'react'
import InterviewProvider, { useInterview } from '../Interviews/InterviewContext/InterviewProvider';
import TextInterview from './section/TextInterview';
import VideoInterview from './section/VideoInterview';

function InterviewAnswer() {
    const { interview } = useInterview()

    return (
        <div>
            {
                interview?.interviewType === 'video' && <VideoInterview />

            }
            {
                interview?.interviewType === 'text' && <TextInterview />
            }
        </div>
    )
}

export function Component() {
    return (
        <InterviewProvider>
            <InterviewAnswer />
        </InterviewProvider>
    );
}

Component.displayName = "Answer";
