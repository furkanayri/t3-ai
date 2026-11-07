import Configs from "@/models/Configs.model"
import { ConfigsService } from "./service"

const service = () => new ConfigsService(Configs)

export default service