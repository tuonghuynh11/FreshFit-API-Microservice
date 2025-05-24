import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Get, Patch, Post, Put } from "../decorators/handlers";
import {
  EXPERT_AVAILABILITY_MESSAGES,
  EXPERT_MESSAGES,
  EXPERT_SCHEDULE_MESSAGES,
} from "../common/messages/index.messages";
import ExpertRepository from "../database/repositories/epxert.repository";
import Authorize from "../decorators/authorize";
import { SystemRole } from "../utils/enums";
import { UseMiddlewares } from "../decorators/middleware";
import { validatePagination } from "../middlewares/pagination.middlewares";
import { validateMonth } from "../middlewares/month.middlewares";
import { validateDate } from "../middlewares/date.middlewares";

@Controller("/experts")
export default class ExpertController {
  @Post("/create")
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ExpertRepository.create(req);
      res.locals.message = EXPERT_MESSAGES.CREATE_EXPERT_SUCCESS;
      res.locals.data = response;
      next();
    } catch (error) {
      next(error);
    }
  }
  @Get("/exists/:userId")
  public async checkExpertExistByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.checkExpertExistByUserId({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_INFO_SUCCESS;
      res.locals.data = {
        expertInfo,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Get("/info/access-token")
  @Authorize([SystemRole.Expert])
  public async getExpertInfoByAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.getExpertInfoByAccessToken({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_INFO_SUCCESS;
      res.locals.data = {
        expertInfo,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Patch("/:id")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async updateExpertGeneralInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.updateExpertGeneralInfo({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.UPDATE_EXPERT_GENERAL_INFO_SUCCESS;
      res.locals.data = {
        expertInfo,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Get("/:userId")
  @Authorize([SystemRole.Admin])
  public async getExpertInfoByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expertInfo = await ExpertRepository.getExpertInfoByUserId({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_INFO_SUCCESS;
      res.locals.data = {
        expertInfo,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Get("/")
  @Authorize("*")
  @UseMiddlewares(validatePagination)
  public async filterExpert(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { experts, limit, page, total_items, total_pages } =
        await ExpertRepository.filterExpert(req);
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_SUCCESS;
      res.locals.data = {
        experts,
        limit,
        page,
        total_items,
        total_pages,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Post("/availability/set")
  @Authorize([SystemRole.Expert])
  public async createAvailabilities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ExpertRepository.createAvailabilities({
        req,
        res,
      });
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.CREATE_AVAILABILITY_SUCCESS;
      res.locals.data = response;
      next();
    } catch (error) {
      next(error);
    }
  }

  @Get("/availability/:expertId")
  @Authorize([SystemRole.Admin, SystemRole.Expert])
  @UseMiddlewares(validateMonth)
  public async getExpertAvailabilityById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const availabilities = await ExpertRepository.getExpertAvailabilityById(
        req
      );
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.GET_AVAILABILITIES_SUCCESS;
      res.locals.data = {
        availabilities,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Put("/availability/:id")
  @Authorize([SystemRole.Expert])
  public async updateAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const availability: any = await ExpertRepository.updateAvailability({
        req,
        res,
      });
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.UPDATE_AVAILABILITY_SUCCESS;
      res.locals.data = {
        availability,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Delete("/availability/:id")
  @Authorize([SystemRole.Expert])
  public async deleteAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response: any = await ExpertRepository.deleteAvailability({
        req,
        res,
      });
      res.locals.message =
        EXPERT_AVAILABILITY_MESSAGES.DELETE_AVAILABILITY_SUCCESS;
      res.locals.data = null;

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Get("/all/schedules")
  @Authorize([SystemRole.User])
  @UseMiddlewares(validateDate)
  public async getAllExpertScheduleInSpecificDayForUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const experts =
        await ExpertRepository.getAllExpertScheduleInSpecificDayForUser(req);
      res.locals.message = EXPERT_SCHEDULE_MESSAGES.GET_EXPERT_SCHEDULE_SUCCESS;
      res.locals.data = {
        experts,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Get("/schedule/:expertId")
  @Authorize([SystemRole.User])
  @UseMiddlewares(validateMonth)
  public async getExpertScheduleForUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schedules = await ExpertRepository.getExpertScheduleForUser(req);
      res.locals.message = EXPERT_SCHEDULE_MESSAGES.GET_EXPERT_SCHEDULE_SUCCESS;
      res.locals.data = {
        schedules,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Get("/statistic/general")
  @Authorize([SystemRole.Expert])
  public async getExpertStatistic(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statistic = await ExpertRepository.getExpertStatistic({ req, res });
      res.locals.message = EXPERT_MESSAGES.GET_EXPERT_STATISTIC_SUCCESS;
      res.locals.data = {
        statistic,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Post("/:id/certifications")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async addNewCertification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const certification = await ExpertRepository.addNewCertification({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.ADD_CERTIFICATION_SUCCESS;
      res.locals.data = {
        certification,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Patch("/:id/certifications/:certificationId")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async updateCertification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const certification = await ExpertRepository.updateCertification({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.UPDATE_CERTIFICATION_SUCCESS;
      res.locals.data = {
        certification,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Delete("/:id/certifications")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async deleteCertifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const certification = await ExpertRepository.deleteCertifications({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.DELETE_CERTIFICATION_SUCCESS;
      res.locals.data = {};

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Put("/:id/languages")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async updateExpertLanguages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const expert = await ExpertRepository.updateExpertLanguages({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.UPDATE_LANGUAGES_SUCCESS;
      res.locals.data = {
        expert,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Put("/:id/skills")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async updateExpertSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const skills = await ExpertRepository.updateExpertSkills({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.UPDATE_MAIN_SKILLS_SUCCESS;
      res.locals.data = {
        skills,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Post("/:id/experiences")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async addNewExperiences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const experience = await ExpertRepository.addNewExperiences({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.ADD_NEW_EXPERIENCE_SUCCESS;
      res.locals.data = {
        experience,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Patch("/:id/experiences/:experienceId")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async updateExperiences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const experience = await ExpertRepository.updateExperiences({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.UPDATE_EXPERIENCE_SUCCESS;
      res.locals.data = {
        experience,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Delete("/:id/experiences")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async deleteExperiences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ExpertRepository.deleteExperiences({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.DELETE_EXPERIENCE_SUCCESS;
      res.locals.data = {};

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Post("/:id/educations")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async addNewEducations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const education = await ExpertRepository.addNewEducations({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.ADD_NEW_EDUCATION_SUCCESS;
      res.locals.data = {
        education,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Patch("/:id/educations/:educationId")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async updateEducations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const education = await ExpertRepository.updateEducations({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.UPDATE_EDUCATION__SUCCESS;
      res.locals.data = {
        education,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Delete("/:id/educations")
  @Authorize([SystemRole.Expert, SystemRole.Admin])
  public async deleteEducations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ExpertRepository.deleteEducations({
        req,
        res,
      });
      res.locals.message = EXPERT_MESSAGES.DELETE_EDUCATION_SUCCESS;
      res.locals.data = {};

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
}
