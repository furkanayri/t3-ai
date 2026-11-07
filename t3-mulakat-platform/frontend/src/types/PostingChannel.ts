export type PostingChannel = {
    _id: string
    tenantId: string
    domain?: string
    subdomain?: string
    connectionChannelId?: string //helpinjobsPostingChannelId
    type: "jobportalpage" | "careerpage" | "connection"
    status: "active" | "passive"
    name: string
    isOwner: boolean
}

export type PostingChannelPayload = Omit<PostingChannel, "_id">