import { tenantApiClient } from "src/libs/apiClient";
import { TemplatedEmailPaylaod } from "src/types";

export async function postSendTemplatedEmailService(payload: TemplatedEmailPaylaod) {
    const res = await tenantApiClient.post(`/emails/template`, payload);

    return res.data;
}