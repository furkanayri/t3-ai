import { Cable, KeyboardArrowDown, KeyboardArrowUp, Link as LinkIcon } from '@mui/icons-material'
import { Chip, IconButton, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from 'src/providers'
import { PostingChannel } from 'src/types'

const applicationTypeMapper = {
    "careerpage": "Career Page",
    "jobportalpage": "Job Portal Page",
    "connection": "Connection"
}

export default function List({ items }: { items: Array<PostingChannel> }) {
    const { t } = useTranslation()
    const { activeTenantId } = useAuth()

    const mainChannels = items?.filter(item => (item.tenantId as any)?._id === activeTenantId && item.type !== 'connection')
    const tenantsChannels = items?.filter(item => (item.tenantId as any)?._id !== activeTenantId && item.type !== 'connection')
    const connectionChannels = items?.filter(item => item.type === 'connection')
    return (
        <>
            <Typography variant='h5'>{"Company"}</Typography>
            <div className='flex flex-col gap-4'>
                {mainChannels.map(item => {
                    const connectedChannels = connectionChannels.filter(channel => channel.connectionChannelId === item._id)
                    const tenant: any = item?.tenantId
                    const url = !!item?.subdomain ?
                        `${item?.subdomain}.${item?.domain}` :
                        `${item?.domain}`

                    return (
                        <ChannelItem
                            key={item._id}
                            item={item}
                            url={url}
                            tenant={tenant}
                            connectedChannels={connectedChannels}
                        />
                    )
                })}
            </div>
            <Typography variant='h5'>{"Tenants"}</Typography>
            <div className='flex flex-col gap-4'>
                {tenantsChannels.map(item => {
                    const tenant: any = item?.tenantId
                    const url = !!item?.subdomain ?
                        `${item?.subdomain}.${item?.domain}` :
                        `${item?.domain}`

                    return (
                        <ChannelItem
                            key={item._id}
                            item={item}
                            url={url}
                            tenant={tenant}
                        />
                    )
                })}
            </div>
        </>
    )
}

const ChannelItem = ({ item, url, tenant, connectedChannels }: { item: PostingChannel, url: string, tenant: any, connectedChannels?: Array<PostingChannel> }) => {
    const { t } = useTranslation()
    const [isConnectionsOpen, setConnectionsOpen] = useState(false)
    return (
        <div key={item._id} className='relative flex w-full border-2 border-gray-400 bg-gray-50 rounded-lg'>
            <div className='flex gap-2 w-1/3 border-r-2 px-8 py-3 items-center'>
                <LinkIcon color='inherit' />
                <Link to={"https://" + url} target='_blank'>
                    <p className='text-xl hover:underline cursor-pointer'>{url}</p>
                </Link>
            </div>
            <div className='grow'>
                <div className='flex justify-between px-4 py-3'>
                    <div>
                        <p className='text-xl'>{item?.name}</p>
                        <p className='text-sm font-light'>#{item?._id}</p>
                        <p className='text-sm'>Tenant: {tenant?.name}</p>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                        <Chip
                            size='small'
                            label={item.status}
                            sx={{ borderRadius: 1 }}
                        />
                        <p className='text-sm'>{applicationTypeMapper[item.type]}</p>
                        {!!connectedChannels && connectedChannels.length > 0 && (
                            <div className='flex gap-2 items-center'>
                                <p className='text-sm'>{connectedChannels.length} {t('Connected')}</p>
                                <IconButton size='small' onClick={() => setConnectionsOpen(prev => !prev)}>
                                    {isConnectionsOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                </IconButton>
                            </div>
                        )}
                    </div>
                </div>
                {isConnectionsOpen && (
                    <div className='flex flex-col gap-2 px-4 py-3 border-t-2'>
                        {connectedChannels?.map(channel => {
                            return (
                                <div key={channel._id} className='flex gap-2 items-center'>
                                    <div className='text-gray-500'>
                                        <Cable color='inherit' />
                                    </div>
                                    <p className='text-lg'>{(channel?.tenantId as any)?.name}</p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>

    )

}