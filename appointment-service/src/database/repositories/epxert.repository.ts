import { Request } from "express";
import { CreateExpertUserBody } from "../requests/expert.requests";
import { Expert } from "../entities/Expert";
import { ExpertSkill } from "../entities/ExpertSkill";

export default class ExpertRepository {
  static async create(req: Request) {
    const {
      userId,
      specialization,
      experienceYears,
      bio,
      certifications,
      languages,
      consultationFee,
      mainSkills,
      experiences,
      educations,
    } = req.body as CreateExpertUserBody & { userId: string | undefined };

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertSkillsRepository = dataSource.getRepository(ExpertSkill);

    const newExert = expertRepository.create({
      userId,
      specialization,
      experience_years: experienceYears,
      bio,
      certifications,
      languages,
      consultation_fee: consultationFee,
      experiences,
      educations,
      createdBy: "admin",
    });
    await expertRepository.save(newExert);
    const expertSkills = mainSkills.map((id: string) => {
      return expertSkillsRepository.create({
        expertId: newExert.id,
        skillId: id,
      });
    });
    await expertSkillsRepository.save(expertSkills);
    return newExert;
  }
}
