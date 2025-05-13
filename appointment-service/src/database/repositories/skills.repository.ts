import { Request, Response } from "express";
import { Skill } from "../entities/Skill";
import { CreateSkillBody, DeleteSkillBody } from "../requests/skill.requests";
import { BadRequestError } from "../../utils/errors";
import { SKILLS_MESSAGES } from "../../common/messages/index.messages";
import { In } from "typeorm";
import { ExpertSkill } from "../entities/ExpertSkill";

export default class SkillsRepository {
  static getAllSkills = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;

    const { dataSource } = req.app.locals;
    const skillsRepository = dataSource.getRepository(Skill);
    const result = await skillsRepository.find();
    return result;
  };
  static createNewSkill = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { dataSource } = req.app.locals;
    const skillsRepository = dataSource.getRepository(Skill);
    const { name } = req.body as CreateSkillBody;

    if (!name) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_NAME_REQUIRED);
    }

    const existingSkill = await skillsRepository.findOne({ where: { name } });

    if (existingSkill) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_NAME_ALREADY_EXISTED);
    }
    const newSkill = skillsRepository.create({
      name,
    });
    await skillsRepository.save(newSkill);
    return newSkill;
  };
  static updateSkill = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { dataSource } = req.app.locals;
    const { id } = req.params;
    const skillsRepository = dataSource.getRepository(Skill);
    const { name } = req.body as CreateSkillBody;

    // Check if id is provided
    if (!id) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_ID_REQUIRED);
    }
    // Check if skill exists
    const skill = await skillsRepository.findOne({ where: { id } });

    if (!skill) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_NOT_FOUND);
    }

    // Check if name is provided
    if (!name) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_NAME_REQUIRED);
    }

    // Check if skill name already exists
    const existingSkill = await skillsRepository.findOne({ where: { name } });

    if (existingSkill && existingSkill.id !== skill.id) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_NAME_ALREADY_EXISTED);
    }

    // Update skill
    skillsRepository.merge(skill, {
      name,
    });
    const newSkill = await skillsRepository.save(skill);
    return newSkill;
  };
  static deleteSkills = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { dataSource } = req.app.locals;
    const skillsRepository = dataSource.getRepository(Skill);
    const expertSkillsRepository = dataSource.getRepository(ExpertSkill);
    const { skillIds } = req.body as DeleteSkillBody;

    // Check if id is provided
    if (!skillIds || skillIds.length === 0) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_IDS_REQUIRED);
    }
    // Check if skill exists
    const skills = await skillsRepository.find({
      where: {
        id: In(skillIds),
      },
    });
    if (skillIds.length !== skills.length) {
      throw new BadRequestError(SKILLS_MESSAGES.SKILL_NOT_FOUND);
    }
    // check if skill is used by expert
    const expertSkills = await expertSkillsRepository.find({
      where: {
        skill: {
          id: In(skillIds),
        },
      },
    });
    if (expertSkills.length > 0) {
      throw new BadRequestError(
        SKILLS_MESSAGES.DELETE_SKILL_FAILED +
          " because it is used by expert " +
          expertSkills.map((expertSkill: ExpertSkill) => expertSkill.expertId)
      );
    }
    // Delete skills
    await skillsRepository.remove(skills);
    return null;
  };
}
