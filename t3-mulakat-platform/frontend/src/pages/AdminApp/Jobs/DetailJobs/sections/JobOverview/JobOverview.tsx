import { ApplicantQuestions, ApplicantSkills, Description, FormDefinitions, GeneralInfo, ListOfChannels } from '.';

export default function JobOverview() {
  return (
    <div className="flex items-start gap-x-4">
      <div className="flex-[2] space-y-4">
        <GeneralInfo />
        <Description />
      </div>
      <div className="flex-[1] space-y-4">
        <ListOfChannels />
        <FormDefinitions />
        <ApplicantQuestions />
        {/* <ApplicantSkills /> */}
      </div>
    </div>
  );
}