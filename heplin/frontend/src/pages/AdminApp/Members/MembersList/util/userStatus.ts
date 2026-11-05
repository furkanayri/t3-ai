export const userStatus = (
    data: string
): {
    color: 'success' | 'default' | 'error' | 'warning' | 'info';
    label: string;
} => {
    switch (data) {
        case 'active':
            return {
                color: 'success',
                label: 'active',
            };
        case 'inactive':
            return {
                color: 'error',
                label: 'inactive',
            };
        case 'pending':
            return {
                color: 'warning',
                label: 'pending',
            };
        default:
            return {
                color: 'info',
                label: 'unknown',
            };
    }
};
