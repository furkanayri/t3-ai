import jwt from "jsonwebtoken";
import axios from 'axios';
import moment from 'moment';
import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";
import sendEmail from "@/utils/mail/sendMail";

export default async function createMeeting(ctx: Context) {
  ctx.request.body.tenantId = ctx.params.tenantId;
  ctx.request.body.createdBy = ctx.state.user?._id;
  const candidateId = ctx.request.body.candidateId;
  if (ctx.request.body.type === "online") {
    const adminRes = await ctx.service("employees").findOne({
      _id: ctx.request.body.hostId,
    });

    try {
      let zak = ''
      const zoomResponse = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'account_credentials',
          account_id: process.env.ZOOM_ACCOUNT_ID,
        },
        auth: {
          username: process.env.ZOOM_CLIENT_ID,
          password: process.env.ZOOM_SECRET_ID,
        },
      });


      const accessToken = zoomResponse.data.access_token;
      const config = {
        method: 'get',
        url: 'https://api.zoom.us/v2/users/me/token?type=zak',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      };

      const zakResponse = await axios.get('https://api.zoom.us/v2/users/me/token?type=zak', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      zak = zakResponse.data.token;

      const adjustedStartTime = moment(ctx.request.body.date).add(3, 'hours').toISOString();
      if (accessToken) {
        const meetingDetails = {
          "agenda": ctx.request.body.title,
          "default_password": false,
          "duration": 60,
          "password": "123456",
          "pre_schedule": false,
          "schedule_for": process.env.ZOOM_EMAIL,
          "start_time": adjustedStartTime,
          "timezone": "Europe/Istanbul",
          "topic": ctx.request.body.title,
          "type": 2
        };

        const createMeetingResponse = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingDetails, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const meetingData = createMeetingResponse.data;


        if (meetingData) {
          const adminTokenPayload = {
            userName: adminRes?.name,
            role: 1,
            meetingNumber: meetingData?.id,
            passWord: "123456",
            zak: zak
          };

          const attendeePromises = ctx.request.body.attendees.map(async attendee => {
            const employee = await ctx.service("employees").findOne({
              _id: attendee.employeeId,
            });

            const attendeeTokenPayload = {
              userName: employee.name + ' ' + employee.surname, // Katılımcının adını ve soyadını kullanıyoruz
              role: 0, // Katılımcı rolü
              meetingNumber: meetingData?.id,
              passWord: "123456"
            };

            const attendeeToken = jwt.sign(attendeeTokenPayload, "123456", { algorithm: 'HS256' });
            const attendeeUrl = process.env.WEB_APP_URL + `/?user=${attendeeToken}`;

            return {
              ...attendee,
              attendeeUrl: attendeeUrl
            };
          });

          const updatedAttendees = await Promise.all(attendeePromises);

          ctx.request.body.attendees = updatedAttendees;

          const adminToken = jwt.sign(adminTokenPayload, "123456", { algorithm: 'HS256' });

          const adminLink =
            process.env.WEB_APP_URL +
            `/?user=${adminToken}`;

          ctx.request.body.adminUrl = adminLink;

          const tenantId = ctx.params.tenantId;

          const tenant = await ctx.service("tenants").findOne({
            _id: tenantId,
          });

          const candidate = await ctx.service("candidates").findOne({
            _id: candidateId,
          });



          const userTokenPayload = {
            userName: candidate?.name,
            role: 0,
            meetingNumber: meetingData?.id,
            passWord: "123456"
          };

          const userToken = jwt.sign(userTokenPayload, "123456", { algorithm: 'HS256' });

          const userLink =
            process.env.WEB_APP_URL + `/?user=${userToken}`;

          ctx.request.body.candicateUrl = userLink;

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

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1', tenant?.senderMailAddress, recipientEmail)
          await sendEmail(tenant?.senderMailAddress, recipientEmail, "Meeting", "invitation-meeting", {
            link: process.env.WEB_APP_URL + `/meetings/?user=${userToken}`,
            date: formattedDate,
          })

          ctx.request.body.zoomMeetingId = meetingData?.id;

        }
      } else {
        console.error('No access token available');
      }
    } catch (error) {
      console.error('Error fetching Zoom access token:', error);
    }
  }
  const meeting = await ctx.service("meetings").create(ctx.request.body);
  ctx.body = { meeting };
} 