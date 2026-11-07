import User from "@/models/Users.model"
import { UsersService } from "./service"

const service = () => new UsersService(User)

export default service