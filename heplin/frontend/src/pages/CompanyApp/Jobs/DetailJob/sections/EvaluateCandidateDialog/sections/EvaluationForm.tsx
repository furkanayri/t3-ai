import { useFormikContext } from "formik";
import { useMemo } from "react";
import { CandidateEvaluationPayload } from "src/types";
import { EvaluationTemplate } from "src/types/EvaluationTemplate";
import { EvaluationScoreCard, EvaluationFields, EvaluationTitle } from ".";
import { useTranslation } from "react-i18next";

export default function EvaluationForm({ templates }: { templates: EvaluationTemplate[] }) {
    const { values } = useFormikContext<CandidateEvaluationPayload>()
    const { t } = useTranslation()

    const selectedTemplate = useMemo(() => templates?.find(template => template._id === values.evaluationTemplateId),
        [values.evaluationTemplateId])



    return (
        !selectedTemplate ? null :
            <>
                <EvaluationTitle title={selectedTemplate?.title} />
                <EvaluationScoreCard scoreCards={selectedTemplate.scoreCards} />
                {!values.scoreCard && (
                    <p className="text-red-500 mt-2">{t('Please fill in all score cards before submitting.')}</p>
                )}
                <EvaluationFields fields={selectedTemplate.fields} />
                {!values.fields && (
                    <p className="text-red-500 mt-2">{t('Please fill in all questions cards before submitting.')}</p>
                )}
            </>
    )
}
