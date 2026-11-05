
export interface ChannelDomain {
    domain: string;
    subdomain: string;
    heplinjobsPostingChannelId: string;
}

export interface ChannelForms {
    name: string;
    domain: string;
    subdomain: string;
    helpinjobsPostingChannelId: string;
    application: 'linkedin' | 'kariyernet' | 'indeed' | 'heplincareerpage' | 'heplinjobs';
    // status: 'active' | 'inactive' | 'pending';
}