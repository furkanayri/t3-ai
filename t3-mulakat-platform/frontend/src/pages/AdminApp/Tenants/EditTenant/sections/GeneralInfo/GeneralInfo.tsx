import { Formik } from "formik";
import { useTenantContext } from "../../EditTenant";
import { TenantPayload } from "src/types";
import { Stack } from "@mui/material";
import GeneralForm from "../../../sections/Form/GeneralForm";
import LogoForm from "../../../sections/Form/LogoForm";
import ContactInformation from "../../../sections/Form/ContactInformation";
import ParentTenantForm from "../../../sections/Form/ParentTenantForm";
import { LoadingButton } from "@mui/lab";

function TenantResource(data?: any): TenantPayload {
    return {
        name: data?.name ?? "",
        legalName: data?.legalName ?? "",
        address: data?.address ?? "",
        email: data?.email ?? "",
        phone: data?.phone ?? "",
        logo: data?.logo ?? "",
        subdomain: data?.subdomain ?? "",
        website: data?.website ?? "",
        customDomain: data?.customDomain ?? "",
        description: data?.description ?? "",
        isActive: data?.isActive ?? false,
        isDeleted: data?.isDeleted ?? false,
        parentTenantId: data?.parentTenantId ?? null,
        contacts: data?.contacts ?? [],
        country: data?.country ?? "TR",
        city: data?.city ?? "",
        companySize: data?.companySize ?? "",
    }
}

export default function GeneralInfo() {
    const {
        onUpdateTenant, tenant
    } = useTenantContext();

    const tenantResource = TenantResource(tenant);
    return <Formik
        initialValues={
            tenantResource
        }
        enableReinitialize
        onSubmit={(values, helpers) => {
            onUpdateTenant?.(values, helpers);
        }}
    >
        {({ handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
                <Stack
                    spacing={3}
                    sx={{ mb: 3 }}
                >
                    <GeneralForm />
                    <LogoForm />
                    <ContactInformation />
                    <ParentTenantForm />
                    <div className="flex items-center justify-end">
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            loading={isSubmitting}
                        >
                            Save Changes
                        </LoadingButton>
                    </div>
                </Stack>
            </form>
        )}
    </Formik>
}