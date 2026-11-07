import { apiClient } from 'src/libs';

export async function deleteTeamMember({ userId }: { userId: string }) {
    const res = await apiClient.delete(`/v1/users/${userId}`)

    return res.data
}
