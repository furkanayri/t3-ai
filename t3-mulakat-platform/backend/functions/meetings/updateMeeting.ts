import jwt from "jsonwebtoken";
import sendEmail from "@/utils/mail/sendMail"
import axios from 'axios';
import moment from 'moment';

export default async function updateMeeting(ctx: Context) {
  const { tenantId, meetingId } = ctx.params;
  delete ctx.request.body.tenantId
  delete ctx.request.body.createdBy

  const candidateId = ctx.request.body.candidateId;

  if (ctx.request.body.type === "online") {
    const adminRes = await ctx.service("employees").findOne({
      _id: ctx.request.body.hostId,
    });

    try {
      let zak = ''
      //ACCESS TOKEN ALMA
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
      //ZAK TOKEN ALMA
      const config = {
        method: 'get',
        url: 'https://api.zoom.us/v2/users/me/token?type=zak',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      };

      const zakResponse = await axios(config)

      zak = zakResponse.data.token;
      // console.log("zak", JSON.stringify(zak, null, 2));

      const adjustedStartTime = moment(ctx.request.body.date).add(3, 'hours').toISOString();
      if (accessToken) {
        const meetingDetails = {
          "agenda": ctx.request.body.title,
          "start_time": adjustedStartTime, // Example start time in UTC
          "topic": ctx.request.body.title,
        };

        // ZOOM ÜZERİNDEN TOPLANTI OLUŞTUR
        const createMeetingResponse = await axios.patch(`https://api.zoom.us/v2/meetings/${ctx.request.body.zoomMeetingId}`, meetingDetails, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const meetingData = createMeetingResponse.data;

        if (meetingData) {
          // Admin JWT oluştur
          const adminTokenPayload = {
            userName: adminRes?.name,
            role: 1,
            meetingNumber: meetingData?.id,
            passWord: "123456",
            zak: zak
          };
          const adminToken = jwt.sign(
            adminTokenPayload,
            "123456"
          );
          const adminLink =
            process.env.WEB_APP_URL +
            `/?user=${adminToken}`;

          ctx.request.body.adminUrl = adminLink;

          // User JWT oluştur
          const tenantId = ctx.params.tenantId;


          const tenant = await ctx.service("tenants").findOne({
            _id: tenantId,
          });

          const candidate = await ctx.service("candidates").findOne({
            _id: candidateId
          });

          const userTokenPayload = {
            userName: candidate?.name,
            role: 0,
            meetingNumber: meetingData?.id,
            passWord: "123456",
            zak: ''
          };

          const userToken = jwt.sign(
            userTokenPayload,
            "123456"
          );

          const userLink =
            process.env.WEB_APP_URL + `/?user=${userToken}`;

          ctx.request.body.candicateUrl = userLink;

          //EMAIL İŞLEMLERİ
          const formattedDate = new Date(ctx.request.body.date).toLocaleString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          });
          const recipientEmail = candidate?.email;

          ctx.state.sender = tenant?.senderMailAddress;
          ctx.state.recipient = recipientEmail;
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1', tenant?.senderMailAddress, recipientEmail, userLink)

          await sendEmail(tenant?.senderMailAddress, recipientEmail, "Meeting", "invitation-meeting", {
            link: userLink,
            date: formattedDate,
          })
        }
      } else {
        console.error('No access token available');
      }
    } catch (error) {
      console.error('Error fetching Zoom access token:', error);
    }
  }

  const meeting = await ctx.service('meetings').updateOne({
    tenantId,
    _id: meetingId,
  }, ctx.request.body);
  ctx.body = { meeting };
}