import Meeting from "@/models/Meetings.model"
import { MeetingsService } from "./service"

const service = () => new MeetingsService(Meeting)

export default service