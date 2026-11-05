import { Box, Chip, Divider, IconButton, List, ListItem, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import { useCandidateDetail } from '../../../CandidateApplicantDetail';
import { ArrowDropDown, ArrowDropUp, AttachFileOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { formatMontYear } from 'src/utils/date-format';
import { useTranslation } from 'react-i18next';
import { DownloadFileButton } from 'src/components';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const labels = {
  //jobType
  fulltime: 'Full-time',
  parttime: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  voluntary: 'Voluntary',
  intern: 'Internship',
  other: 'Other',
  //locationType
  hybrid: 'Hybrid',
  onsite: 'On-site',
  remote: 'Remote',
}
export default function UserInfo() {
  const { t, i18n } = useTranslation();
  const [experienceOpen, setExperienceOpen] = useState<boolean>(false)
  const [educationOpen, setEducationOpen] = useState<boolean>(false)
  const [languageOpen, setLanguageOpen] = useState<boolean>(false)
  const [skillOpen, setSkillOpen] = useState<boolean>(false)
  const [certificateOpen, setCertificateOpen] = useState<boolean>(false)
  const dynamicLanguage = i18n.language
  const { candidateState } = useCandidateDetail();

  const profile = candidateState.data?.userId;

  const skills = candidateState?.data?.skills;
  const languages = candidateState?.data?.languages;
  const experiences = candidateState?.data?.experiences;
  const educations = candidateState?.data?.educations;
  const certificates = candidateState?.data?.certificates;

  const handleEducationToggle = async () => {
    setEducationOpen(pre => !pre)
  }

  const handleExperienceToggle = async () => {
    setExperienceOpen(pre => !pre)
  }

  const handleLanguageToggle = async () => {
    setLanguageOpen(pre => !pre)
  }

  const handleSkillToggle = async () => {
    setSkillOpen(pre => !pre)
  }
  const handleCertificateToggle = async () => {
    setCertificateOpen(pre => !pre)
  }

  return (
    <List>
      {[
        {
          label: t('email'), value: (
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {profile?.email}
            </Typography>
          )
        },
        {
          label: t('phone'), value: (
            <Typography color="text.secondary" variant="body2">
              <Box display="flex" alignItems="center" gap={1}>{profile?.phone &&
                (<IconButton
                  component="a"
                  href={`https://wa.me/${profile?.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ padding: 0 }}
                >
                  <WhatsAppIcon color="success" />
                </IconButton>)}

                <Chip
                  size="small"
                  label={profile?.phone ? profile.phone : t('noPhoneNumber')}
                />
              </Box>
            </Typography>
          )
        },
        // {
        //   label: t('skills'),
        //   value: (
        //     <div className="flex items-center gap-1 flex-wrap">
        //       {(skills || []).length > 0 ? skills?.map(skill => skill.skills.map((item: any) =>
        //         <Chip
        //           size="small"
        //           label={item?.name}
        //           key={item?._id}
        //         />
        //       )) : (
        //         <Chip
        //           size="small"
        //           label={t('noSkillsInfo')}
        //         />
        //       )}
        //     </div>
        //   ),
        // },
        {
          label: t('languages'),
          value: (
            <div className="flex items-center gap-1 flex-wrap">
              {(languages || []).length > 0 ? (
                languages?.map((language) => (
                  <Chip
                    size="small"
                    label={`${language.name} - ${language.languageLevel}`}
                    key={language._id}
                  />
                ))
              ) : (
                <Chip
                  size="small"
                  label={t('noLanguageInfo')}
                />
              )}
            </div>
          ),
        },
        {
          label: t('experiences'),
          value: (
            <div className="flex items-center gap-1 flex-wrap">
              <IconButton onClick={handleExperienceToggle} size='small'>
                {experienceOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </IconButton>
            </div>
          ),
          experiences: (experiences || []).length > 0 ? (
            <div>
              {experiences?.map((exp, ind) =>
                <div className='py-2' key={ind}>
                  <Typography variant='subtitle2' fontWeight={700}>{exp?.title}</Typography>
                  <Typography variant='subtitle2' fontWeight={500}>{exp?.company}</Typography>
                  <Typography variant="subtitle2">
                    {[
                      exp?.jobType && labels[exp.jobType as keyof typeof labels] ? labels[exp.jobType as keyof typeof labels] : null,
                      exp?.locationType && labels[exp.locationType as keyof typeof labels] ? labels[exp.locationType as keyof typeof labels] : null
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                  <Typography variant="subtitle2">
                    {formatMontYear(exp.startDate)}
                    {(exp.isOngoing || exp.endDate) ? ` - ${exp.isOngoing ? t('present') : formatMontYear(exp.endDate)}` : ''}
                  </Typography>
                  <Typography variant='caption'>
                    {[exp?.country?.names?.[dynamicLanguage], exp?.city, exp?.district]
                      .filter(Boolean)
                      .join(' ')}
                  </Typography>
                </div>
              )}
            </div>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Chip
                size="small"
                sx={{ width: "30%" }}
                label={t('noExperiencesInfo')}
              />
            </Box>
          )
        },
        {
          label: t('Education'),
          value: (
            <div className="flex items-center gap-x-2 flex-wrap">
              <IconButton onClick={handleEducationToggle} size='small'>
                {educationOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </IconButton>
            </div>
          ),
          educations: (educations || []).length > 0 ? (
            <div className="gap-x-2">
              {educations?.map((edu, ind) =>
                <div className='py-2' key={ind}>
                  <Typography variant='subtitle2' fontWeight={700}>{edu?.institution}</Typography>
                  <Typography variant='subtitle2'>{edu?.degree}</Typography>
                  <Typography variant='subtitle2'>{edu?.major}</Typography>
                  <Typography
                    variant="caption"
                  >
                    {formatMontYear(edu.startDate)} -{' '}
                    {edu.isOngoing ? t('present') : formatMontYear(edu.endDate)}
                  </Typography>
                </div>
              )}
            </div>
          ) :
            (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Chip
                  size="small"
                  sx={{ width: "30%" }}
                  label={t('noEducationInfo')}
                />
              </Box>
            )

        },
        {
          label: t('certificates'),
          value: (
            <div className="flex items-center gap-x-2 flex-wrap">
              <IconButton onClick={handleCertificateToggle} size='small'>
                {certificateOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </IconButton>
            </div>
          ),
          certificates: (certificates || []).length > 0 ? (
            <div className="gap-x-2">
              {certificates?.map((cer, ind) =>
                <div className='py-2' key={ind}>
                  <Typography variant='subtitle2' fontWeight={700}>{cer?.institution}</Typography>
                  <Typography variant='subtitle2'>{cer?.degree}</Typography>
                  <Typography
                    variant="caption"
                  >
                    {formatMontYear(cer.startDate)}
                    {(cer.startDate && cer.endDate) ? ` - ${formatMontYear(cer.endDate)}` : ''}
                  </Typography>
                  <Divider />
                  <div>
                    {cer.files?.map((file: any, fileIndex: any) => (
                      <div key={fileIndex} className="flex items-center justify-between gap-x-2 flex-1 pr-4">
                        <div className="flex items-center gap-x-2">
                          <SvgIcon fontSize="small" color="action">
                            <AttachFileOutlined />
                          </SvgIcon>
                          <Typography variant="subtitle1">{file.fileName}</Typography>
                          <DownloadFileButton fileKey={file.fileKey} />
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          ) :
            (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Chip
                  size="small"
                  sx={{ width: "30%" }}
                  label={t('noCertificatesInfo')}
                />
              </Box>
            )

        },

      ].map((item) => (
        <ListItem
          key={item.label}
          disableGutters
          divider
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: 2,
          }}
        >
          <Stack sx={{ width: '100%' }}>
            <Typography variant="subtitle2">{item.label}</Typography>
            {educationOpen ? item?.educations ?? null : null}
            {experienceOpen ? item?.experiences ?? null : null}
            {/* {languageOpen ? item?.languages ?? null : null}
            {skillOpen ? item?.skills ?? null : null} */}

            {certificateOpen ? item?.certificates ?? null : null}
          </Stack>
          {candidateState.isLoading ? <Skeleton width={100} /> : item?.value ?? '-'}
        </ListItem>
      ))}
    </List>
  );
}
