import Categories from "@/models/Categories.model"
import { CategoryService } from "./service"

const service = () => new CategoryService(Categories)

export default service