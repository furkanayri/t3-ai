import PostingChannels from "@/models/PostingChannels.model"
import { PostingChannelsService } from "./service"

const service = () => new PostingChannelsService(PostingChannels)

export default service