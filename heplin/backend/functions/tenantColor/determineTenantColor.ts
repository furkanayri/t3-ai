import Vibrant from 'node-vibrant';
import axios from 'axios';

export default async function determineTenantColor(ctx) {
    const baseURL = 'https://assets.dev.applin.io';
    let primaryColor = '#3498db';
    let logoURL = null;
    const { tenant } = ctx.params;

    const tenantData = await ctx.service("tenants").findOne({ subdomain: tenant });
    console.log("tenantData", tenantData);
    if (tenantData?.tenantColor) {
        primaryColor = tenantData.tenantColor;
        ctx.body = {
            primaryColor,
            logoURL: tenantData.logo ? `${baseURL}/${tenantData.logo}` : null,
        };
        return;
    }

    if (tenantData?.logo) {
        logoURL = `${baseURL}/${tenantData.logo}`;
    }

    if (logoURL) {
        const imageResponse = await axios.get(logoURL, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        const palette = await Vibrant.from(imageBuffer).getPalette();
        primaryColor = palette.Vibrant.hex;
    }

    if (ctx.state.createdTenant) {
        await ctx.service("tenants").update(ctx.state.createdTenant._id, { tenantColor: primaryColor });
    }

    ctx.body = {
        primaryColor,
        logoURL,
    };
}
