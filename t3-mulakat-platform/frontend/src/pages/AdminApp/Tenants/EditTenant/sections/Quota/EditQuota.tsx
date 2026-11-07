import { Formik } from "formik";
import { QuotasForm } from "../../../sections/Form";
import { Button } from "@mui/material";
import { useAdminTenantMutation, useAdminTenantQuotaQuery } from "src/hooks/useServices/admin";
import { useParams } from "react-router";
import { enqueueSnackbar } from "notistack";

const Quotas = () => {
    const { tenantId } = useParams()
    const quotasQuery = useAdminTenantQuotaQuery(tenantId || '')
    const updateQuotaMutation = useAdminTenantMutation()


    const quotas = quotasQuery?.data

    const initialValues = {
        email: {
            credit: quotas?.email?.credit || 0,
            remainingCredit: quotas?.email?.remainingCredit || 0,
        },
        job: {
            credit: quotas?.job?.credit || 0,
            remainingCredit: quotas?.job?.credit || 0,
        },
        aiFeatures: {
            interview: {
                isActive: quotas?.aiFeatures?.interview?.isActive || false,
                maxAllowed: quotas?.aiFeatures?.interview?.maxAllowed || 0,
                remainingCount: quotas?.aiFeatures?.interview?.remainingCount || 0,
            },
            evaluation: {
                isActive: quotas?.aiFeatures?.evaluation?.isActive || false,
                maxAllowed: quotas?.aiFeatures?.evaluation?.maxAllowed || 0,
                remainingCount: quotas?.aiFeatures?.evaluation?.remainingCount || 0,
            },
            videoInterview: {
                isActive: quotas?.aiFeatures?.videoInterview?.isActive || false,
                maxAllowed: quotas?.aiFeatures?.videoInterview?.maxAllowed || 0,
                remainingCount: quotas?.aiFeatures?.videoInterview?.remainingCount || 0,
            },
        },
    };

    return (
        <div>
            <Formik
                initialValues={initialValues}
                onSubmit={(value) => {
                    return updateQuotaMutation.mutateAsync({
                        tenantId: tenantId || '',
                        payload: value
                    },
                        {
                            onSuccess(data, variables, context) {
                                enqueueSnackbar('Quota Updated Succesfuly', { variant: 'success' });
                            },
                            onError(error, variables, context) {
                                enqueueSnackbar('Something is wrong', { variant: 'error' });

                            },
                        }
                    )
                }}
                enableReinitialize
            >
                {({ handleSubmit }) => (
                    quotasQuery.isLoading ? (
                        <p>Loading...</p>
                    ) :
                        <form onSubmit={handleSubmit}>
                            <QuotasForm />
                            <Button variant="contained" type="submit">
                                Submit
                            </Button>
                        </form>
                )}
            </Formik>
        </div>
    );
};
export default Quotas