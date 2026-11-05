import { apiClient } from 'src/libs';

export async function getCountries(query: string) {
  const res = await apiClient.get('/v1/countries?search=' + query);
  return res.data;
}
export async function getCountry(id: string) {
  const res = await apiClient.get('/v1/country/' + id);
  return res.data;
}
