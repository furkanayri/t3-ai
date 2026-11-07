import axios from 'axios';

export default async function deleteMeeting(ctx: Context) {
    const { tenantId, meetingId } = ctx.params;
    const { user } = ctx.state;

    const query = {
        tenantId: tenantId,
        _id: meetingId,
    };
    const meetingDatas = await ctx.service('meetings').findOne(query);
    if (meetingDatas.type === "online") {

        try {
       
          const zoomResponse = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
              grant_type: 'account_credentials',
              account_id: process.env.ZOOM_ACCOUNT_ID, // Replace with your actual account ID
            },
            auth: {
              username: process.env.ZOOM_CLIENT_ID, // Your Zoom Client ID
              password: process.env.ZOOM_SECRET_ID, // Your Zoom Client Secret
            },
          });
    
          const accessToken = zoomResponse.data.access_token;
   
          if (accessToken) {
            const createMeetingResponse = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingDatas.zoomMeetingId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
           
          } else {
            console.error('No access token available');
          }
        } catch (error) {
          console.error('Error fetching Zoom access token:', error);
        }
      }
    const meeting = await ctx.service('meetings').softDelete({
        tenantId,
        _id: meetingId,
    }, user?._id);
    ctx.body = { isSuccess: meeting };
}