import Department from "@/models/Departments.model"
import { DepartmentsService } from "./service"

const service = () => new DepartmentsService(Department)

export default service