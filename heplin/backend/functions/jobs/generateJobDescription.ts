import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { geminiJobContentSchema } from "@/utils/geminiJobContentSchema";


export default async function generateJobDescription(ctx) {
  const { title, language } = ctx.request.body;
  console.log("language:", language);
  console.log("Job Title:", title);
  console.log("Selected Language:", language);

  if (!title) {
    ctx.throw(400, 'Job title is required');
  }

  if (!language || !['tr', 'en'].includes(language)) {
    ctx.throw(400, 'Language must be "tr" or "en"');
  }

  const languageName = language === 'tr' ? 'Turkish' : 'English';
  console.log("languageName:", languageName);

  let responsibilitiesHeading;
  let qualificationsHeading;
  let additionalInfoText;
  let jobDescriptionHeading;
  let preferredReasonsHeading;

  if (language === 'tr') {
    jobDescriptionHeading = 'İş Tanımı:';
    preferredReasonsHeading = 'Tercih Sebepleri:';
    responsibilitiesHeading = 'Görev ve Sorumluluklar:';
    qualificationsHeading = 'Aranan Nitelikler:';
    additionalInfoText = 'Eğer varsa, tercih edilen nitelikler veya ek bilgileri de ekleyebilirsiniz.';
  } else {
    jobDescriptionHeading = 'Job Description:';
    preferredReasonsHeading = 'Preferred Qualifications:';
    responsibilitiesHeading = 'Responsibilities:';
    qualificationsHeading = 'Qualifications:';
    additionalInfoText = 'If applicable, you can also include a section for preferred qualifications or additional information.';
  }

  const systemMessage = `
    You are a professional HR assistant. Generate a detailed job description for the given job title.
    
    The job description should be in ${languageName}.
    
    Do not include the job title in the job description.
    
    The job description should include the following sections:
    
    1. <h4 style="font-size:1rem; font-weight:bold;">${jobDescriptionHeading}</h4>
       <p>Provide a general description of the job, including the main responsibilities and role within the company.</p>
    
    2. <h4 style="font-size:0.875rem; font-weight:bold;">${responsibilitiesHeading}</h4>
       <ul>
         <li>List the main duties and responsibilities of the position.</li>
       </ul>
    
    3. <h4 style="font-size:0.875rem; font-weight:bold;">${qualificationsHeading}</h4>
       <ul>
         <li>List the required qualifications and skills for the position.</li>
       </ul>
    
    4. <h4 style="font-size:0.875rem; font-weight:bold;">${preferredReasonsHeading}</h4>
       <ul>
         <li>List any preferred qualifications, skills, or experiences that would be beneficial for the role.</li>
       </ul>
    
    ${additionalInfoText}
    
    Return the job description in the following JSON format:
    
    {
      "description": "The job description here."
    }
    
    Make sure the "description" is in HTML format with the specified styles for headings.
    `;



  try {
    const jobDescription = await GeminiChatCompletion(
      systemMessage,
      `Job Title: "${title}"`,
      geminiJobContentSchema
    );


    ctx.body = { description: jobDescription.description };
  } catch (error) {
    console.error("Error generating job description:", error);
    ctx.throw(500, 'Failed to generate job description');
  }
}
