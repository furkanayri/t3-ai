import { useQuery } from '@tanstack/react-query';
import { getCountries, getCountry } from 'src/services';

export function useCountriesService({ query }: { query: string }) {
  return useQuery(['countries', query], () => getCountries(query), { enabled: !!query });
}
export function useCountryService({ id }: { id: string }) {
  return useQuery(['country', id], () => getCountry(id), { enabled: !!id });
}
