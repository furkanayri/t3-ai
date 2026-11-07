import AccessTokens from "@/models/AccessTokens.model"
import { AccessTokensService } from "./service"

const service = () => new AccessTokensService(AccessTokens)

export default service