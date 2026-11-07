import { Button, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { HTMLRender } from "src/components";
import { useGetJobDetailPublicQuery } from "src/hooks/useServices";

export default function JobOverview() {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const jobId = searchParams.get("jobId") ?? '';
    const dynamicLanguage = i18n.language;
    const jobDetailQuery = useGetJobDetailPublicQuery({ id: jobId })
    const job = useMemo(() => jobDetailQuery?.data?.job, [jobDetailQuery.data]);

    const handleNext = () => {
        setSearchParams(prev => {
            prev.set("activeStep", "2")
            return prev
        })
    }

    const handlePrev = () => {
        setSearchParams(prev => {
            prev.set("activeStep", "0")
            return prev
        })
    }
    return (
        <>
            <div className="p-4 pb-12">
                <Typography variant="h5">{job?.title}</Typography>
                <Typography
                    variant="subtitle2"
                    color={'text.secondary'}
                    className="flex flex-wrap gap-2"
                    sx={{ mt: 1, mb: 2 }}
                >
                    {[
                        job?.country?.names?.[dynamicLanguage],
                        job?.city,
                        job?.district,
                        t(job?.jobType),
                        t(job?.locationType),
                        new Date(job?.createdAt).toLocaleDateString(),
                    ]
                        .filter((field) => !!field)
                        .join(' · ')}
                </Typography>
                <div className="flex items-center gap-2 my-4">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <p className="font-semibold text-lg text-gray-800">Bursiyer İlanı Detayları</p>
                </div>
                <HTMLRender html={job?.content} />
            </div>
            <div className="flex justify-between">
                <Button
                    variant="outlined"
                    onClick={handlePrev}
                >
                    {t('back')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!jobId}
                >
                    {t('next')}
                </Button>
            </div>
        </>
    )
}
