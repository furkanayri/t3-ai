import { Step, StepLabel, Stepper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { JobOverview, ProfileOverview, Form, SelectJob } from "./sections";
import { useSearchParams } from "react-router-dom";
const steps = [
    {
        key: 'selectJob',
        label: 'Select Job',
    },
    {
        key: 'jobOverview',
        label: 'Job Overview',
    },
    {
        key: 'profile',
        label: 'Profile',
    },
    {
        key: 'form',
        label: 'Form',
    },
];
export function Component() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeStep = Number(searchParams.get('activeStep')) || 0;
    const activeStepKey = steps[activeStep].key;

    return (
        <div className="pr-[55px]">
            <Stepper
                alternativeLabel
                activeStep={activeStep}
                sx={{ my: 4 }}
            >
                {steps.map((step) => {
                    return (
                        <Step key={step.key}>
                            <StepLabel>{t(step.label)}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <div className="max-w-6xl mx-auto p-[22px] rounded-[13px]"
                style={{
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                }}
            >
                {activeStepKey === 'selectJob' && <SelectJob />}
                {activeStepKey === 'jobOverview' && <JobOverview />}
                {activeStepKey === 'profile' && <ProfileOverview />}
                {activeStepKey === 'form' && <Form />}
            </div>
        </div>
    )
}

Component.displayName = 'CreateApplicationSteps'