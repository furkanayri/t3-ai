export type Tenant = {
  _id?: string
  name: string
  legalName: string
  email: string
  phone: string
  website: string
  address: string
  country: string
  city: string
  subdomain: string
  customDomain?: string
  logo?: string
  description?: string
  isDeleted?: boolean
  isActive?: boolean
  parentTenantId?: string | null
  contacts: any[]
  companySize?: string
  userName?: string,
  userSurname?: string
  password?: string,
  isAcceptedTOS?: boolean
  isAcceptedKVKK?: boolean
}

export type TenantPayload = Tenant & {
  hasCareerPage?: boolean,
}