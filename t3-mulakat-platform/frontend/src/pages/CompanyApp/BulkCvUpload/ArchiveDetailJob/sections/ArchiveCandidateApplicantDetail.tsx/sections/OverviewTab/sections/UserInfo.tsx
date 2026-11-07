import { Box, Chip, Divider, IconButton, List, ListItem, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import { ArrowDropDown, ArrowDropUp, AttachFileOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadFileButton } from 'src/components';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useCandidateDetail } from '../../../ArchiveCandidateApplicantDetail';
import { formatDateMonthYear } from 'src/utils/all-type-date-format';

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
  console.log('candidateState', candidateState)


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
          label: t('email'),
          value: (
            <Typography color="text.secondary" variant="body2">
              {candidateState?.data?.email}
            </Typography>
          ),
        },
        {
          label: t('phone'), value: (
            <Typography color="text.secondary" variant="body2">
              <Box display="flex" alignItems="center" gap={1}>{candidateState?.data?.phone &&
                (<IconButton
                  component="a"
                  href={`https://wa.me/${candidateState?.data?.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ padding: 0 }}
                >
                  <WhatsAppIcon color="success" />
                </IconButton>)}

                <Chip
                  size="small"
                  label={candidateState?.data?.phone ? candidateState?.data?.phone : t('noPhoneNumber')}
                />
              </Box>
            </Typography>
          )
        },
        {
          label: t('languages'),
          value: (
            <div className="flex items-center gap-1 flex-wrap">
              {(candidateState.data?.languages || []).length > 0 ? (
                candidateState.data?.languages?.map((language) => (
                  <Chip
                    size="small"
                    label={`${language.name} - ${language.languageLevel}`}
                    key={language._id}
                  />
                ))
              ) : (
                <Chip size="small" label={t('noLanguageInfo')} />
              )}
            </div>
          ),
        },
        {
          label: t('experiences'),
          value: (
            <div className="flex items-center gap-1 flex-wrap">
              <IconButton onClick={handleExperienceToggle} size="small">
                {experienceOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </IconButton>
            </div>
          ),
          experiences:
            (candidateState.data?.experience || []).length > 0 ? (
              <div>
                {candidateState.data?.experience?.map((exp, ind) => (
                  <div className="py-2" key={ind}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {exp?.title}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {exp?.company}
                    </Typography>
                    <Typography variant="subtitle2">
                      {`${labels[exp?.jobType as keyof typeof labels]} · ${labels[exp?.locationType as keyof typeof labels]}`}
                    </Typography>
                    <Typography variant="subtitle2">
                      {exp?.startDate ? formatDateMonthYear(exp.startDate) : ''}
                      {exp?.startDate && exp?.endDate ? ' - ' : ''}
                      {exp?.endDate ? (exp?.isOngoing ? t('present') : formatDateMonthYear(exp?.endDate)) : ''}
                    </Typography>
                    <Typography variant='caption'>
                      {[exp?.country?.names?.[dynamicLanguage], exp?.city, exp?.district]
                        .filter(Boolean)
                        .join(' ')}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Chip size="small" sx={{ width: '30%' }} label={t('noExperiencesInfo')} />
              </Box>
            ),
        },
        {
          label: t('Education'),
          value: (
            <div className="flex items-center gap-x-2 flex-wrap">
              <IconButton onClick={handleEducationToggle} size="small">
                {educationOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </IconButton>
            </div>
          ),
          educations:
            (candidateState?.data?.education || []).length > 0 ? (
              <div className="gap-x-2">
                {candidateState?.data?.education?.map((edu, ind) => (
                  <div className="py-2" key={ind}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {edu?.institution}
                    </Typography>
                    <Typography variant="subtitle2">{edu?.degree}</Typography>
                    <Typography variant="subtitle2">{edu?.major}</Typography>
                    <Typography variant="caption">
                      {edu?.startDate ? formatDateMonthYear(edu?.startDate) : ''}
                      {edu?.startDate && edu?.endDate ? ' - ' : ''}
                      {edu?.endDate ? formatDateMonthYear(edu?.endDate) : ''}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Chip size="small" sx={{ width: '30%' }} label={t('noEducationInfo')} />
              </Box>
            ),
        },
        {
          label: t('certificates'),
          value: (
            <div className="flex items-center gap-x-2 flex-wrap">
              <IconButton onClick={handleCertificateToggle} size="small">
                {certificateOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </IconButton>
            </div>
          ),
          certificates:
            (candidateState.data?.certificates || []).length > 0 ? (
              <div className="gap-x-2">
                {candidateState.data?.certificates?.map((cer, ind) => (
                  <div className="py-2" key={ind}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {cer?.institution}
                    </Typography>
                    <Typography variant="subtitle2">{cer?.degree}</Typography>
                    <Typography variant="caption">
                      {cer?.startDate ? formatDateMonthYear(cer?.startDate) : ''}
                      {cer?.startDate && cer?.endDate ? ' - ' : ''}
                      {cer?.endDate ? formatDateMonthYear(cer?.endDate) : ''}
                    </Typography>
                    <Divider />
                    <div>
                      {cer.files?.map((file: any, fileIndex: any) => (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between gap-x-2 flex-1 pr-4"
                        >
                          <div className="flex items-center gap-x-2">
                            <SvgIcon fontSize="small" color="action">
                              <AttachFileOutlined />
                            </SvgIcon>
                            <Typography variant="subtitle1">{file?.fileName}</Typography>
                            <DownloadFileButton fileKey={file?.fileKey} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Chip size="small" sx={{ width: '30%' }} label={t('noCertificatesInfo')} />
              </Box>
            ),
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
            {educationOpen && item.educations}
            {experienceOpen && item.experiences}
            {certificateOpen && item.certificates}
          </Stack>
          {candidateState.isLoading ? (
            <Skeleton width={100} />
          ) : (
            item.value ?? '-'
          )}
        </ListItem>
      ))}
    </List>

  )
}
