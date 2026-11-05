import { useState, useEffect } from 'react';

const usePasteDetected = () => {
    const [isPasted, setIsPasted] = useState(false);

    useEffect(() => {
        const handlePaste = () => {
            setIsPasted(true);
        };

        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    const resetPasteDetection = () => {
        setIsPasted(false);
    };

    return [isPasted, resetPasteDetection];
};

export default usePasteDetected;
