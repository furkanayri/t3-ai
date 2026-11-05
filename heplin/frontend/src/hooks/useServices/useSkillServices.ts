import { useQuery } from '@tanstack/react-query';
import { getAllSkillsService } from 'src/services';

export function useGetAllSkillsQuery(query: any) {
  return useQuery(['skills', query], () => getAllSkillsService(query));

}

