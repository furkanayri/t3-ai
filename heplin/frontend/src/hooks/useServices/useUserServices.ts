import { useMutation } from '@tanstack/react-query';
import { deleteTeamMember } from 'src/services/users';

export function useDeleteTeamMember() {
    return useMutation(deleteTeamMember)
}