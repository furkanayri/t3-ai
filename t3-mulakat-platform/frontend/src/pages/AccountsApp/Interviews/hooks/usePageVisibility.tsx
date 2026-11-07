import { useState, useEffect } from 'react';

const usePageVisibility = () => {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const resetVisibility = () => {
        setIsVisible(!document.hidden);
    };


    return [isVisible, resetVisibility];
};

export default usePageVisibility;
