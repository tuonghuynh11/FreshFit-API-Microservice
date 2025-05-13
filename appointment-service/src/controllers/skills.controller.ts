import { Request, Response, NextFunction } from "express";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Delete, Get, Patch, Post } from "../decorators/handlers";
import SkillsRepository from "../database/repositories/skills.repository";
import { SKILLS_MESSAGES } from "../common/messages/index.messages";
import { SystemRole } from "../utils/enums";

@Controller("/skills")
export default class SkillsController {
  @Get("/")
  @Authorize("*")
  public async getAllSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const skills = await SkillsRepository.getAllSkills({
        req,
        res,
      });
      res.locals.message = SKILLS_MESSAGES.GET_ALL_SKILLS_SUCCESS;
      res.locals.data = {
        skills,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Post("/")
  @Authorize([SystemRole.Admin])
  public async createNewSkill(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const skill = await SkillsRepository.createNewSkill({
        req,
        res,
      });
      res.locals.message = SKILLS_MESSAGES.CREATE_NEW_SKILL_SUCCESS;
      res.locals.data = {
        skill,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Patch("/:id")
  @Authorize([SystemRole.Admin])
  public async updateSkill(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const skill = await SkillsRepository.updateSkill({
        req,
        res,
      });
      res.locals.message = SKILLS_MESSAGES.SKILL_UPDATED_SUCCESS;
      res.locals.data = {
        skill,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Delete("/")
  @Authorize([SystemRole.Admin])
  public async deleteSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const skill = await SkillsRepository.deleteSkills({
        req,
        res,
      });
      res.locals.message = SKILLS_MESSAGES.SKILL_DELETED_SUCCESS;
      res.locals.data = {};

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
}
