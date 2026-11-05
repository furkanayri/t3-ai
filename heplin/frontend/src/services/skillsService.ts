import apiClient from "src/libs/apiClient";

export async function getAllSkillsService({ query }: { query: string }) {

  const res = await apiClient.get(`/v1/skills?search=${query}`);

  return res.data
}
