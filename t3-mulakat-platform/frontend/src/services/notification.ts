import { apiClient } from 'src/libs';

export async function getAllNotificationService() {
    const res = await apiClient.get(`/v1/notifications`)
    return res.data;
}

export async function updateNotificationService() {
    const res = await apiClient.patch(`/v1/notifications/markAsRead`)
    return res.data;
}
export async function deleteNotificationService({ id }: { id: string }) {
    const res = await apiClient.delete(`/v1/notifications/${id}`)
    return res;
}