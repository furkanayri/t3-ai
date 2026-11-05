
import * as yup from 'yup';


const archiveJobGeneralInfo = {
    title: yup.string().required("titleError").min(3, "titleMinError"),
    categoryId: yup.string().required("categoryError"),
    jobType: yup.string().required("jobTypeError"),
    locationType: yup.string().required(),
    country: yup.object().shape({
        names: yup.object().shape({
            en: yup.string().required(),
            tr: yup.string().required(),
        }).required(),
    }).required(),
    city: yup.string().nullable(),
    district: yup.string().nullable(),
    tenantId: yup.string().optional(),

};



const archiveJobContent = {
    content: yup.string().required("contentError"),
};



export const archiveJobGeneralInfoSchema = yup.object().shape({
    ...archiveJobGeneralInfo,
});



export const archiveJobContentSchema = yup.object().shape({
    ...archiveJobContent,
});



export const archiveJobValidationSchema = yup.object().shape({
    ...archiveJobGeneralInfo,

    ...archiveJobContent,
    seoTitle: yup.string().nullable(),
    seoDescription: yup.string().nullable(),
});
