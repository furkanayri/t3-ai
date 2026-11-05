export type Meeting = {
  candidateId: string
  attendees: any
  title: string
  jobId: string
  recruitmentStageStepId: string
  notes: string
  privateNotes: string
  date: Date
  timezone: string
  status: MeetingStatus
  type: MeetingType
  createdBy: string
  hostId?: string,
  tenantId?: string,
  zoomMeetingId?: string,
}

export type MeetingType = "onsite" | "online" | "phone"
export type MeetingStatus = "initial" | "cancelled" | "completed"