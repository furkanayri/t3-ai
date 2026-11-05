import Skill from "@/models/Skills.model"
import { SkillsService } from "./service"

const service = () => new SkillsService(Skill)

export default service