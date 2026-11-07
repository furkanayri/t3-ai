import Employee from "@/models/Employees.model"
import { EmployeesService } from "./service"

const service = () => new EmployeesService(Employee)

export default service