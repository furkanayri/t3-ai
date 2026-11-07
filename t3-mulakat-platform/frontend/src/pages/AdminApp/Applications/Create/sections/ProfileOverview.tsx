import { useSearchParams } from "react-router-dom";
import { useGetUserCertificatesQuery, useGetUserEducationsQuery, useGetUserExperiencesQuery, useGetUserLanguagesQuery } from "src/hooks/useServices/admin";
import Certificates from "src/pages/AccountsApp/Apply/Profile/Certificates";
import Educations from "src/pages/AccountsApp/Apply/Profile/Educations";
import Experiences from "src/pages/AccountsApp/Apply/Profile/Experiences";
import Languages from "src/pages/AccountsApp/Apply/Profile/Languages";
import { Certificate, Education, Experience, Language } from "src/types";
import { array } from "src/utils";

export default function ProfileOverview() {
    const [searchParams, setSearchParams] = useSearchParams()
    const userId = searchParams.get("userId") ?? "";

    const experiencesQuery = useGetUserExperiencesQuery(userId ?? "");
    const experiences = array<Experience>(experiencesQuery?.data?.results)

    const educationsQuery = useGetUserEducationsQuery(userId ?? "");
    const educations = array<Education>(educationsQuery?.data?.results);

    const certificatesQuery = useGetUserCertificatesQuery(userId ?? "");
    const certificates = array<Certificate>(certificatesQuery?.data?.results);

    const languagesQuery = useGetUserLanguagesQuery(userId ?? "");
    const languages = array<Language>(languagesQuery?.data?.results);

    return (
        <div className="flex flex-col gap-4">
            <Educations data={educations} />
            <Experiences data={experiences} />
            <Certificates data={certificates} />
            <Languages data={languages} />
        </div>
    )
}
