import { Request, Response } from "express";
import { CreateExpertUserBody } from "../requests/expert.requests";
import { Expert } from "../entities/Expert";
import { ExpertSkill } from "../entities/ExpertSkill";
import { ExpertCertification } from "../entities/ExpertCertification";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { EXPERT_MESSAGES } from "../../common/messages/index.messages";
import { ExpertExperience } from "../entities/ExpertExperience";
import { ExpertEducation } from "../entities/ExpertEducation";
import UserService from "../../services/user.services";

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
      fullName,
    } = req.body as CreateExpertUserBody & { userId: string | undefined };

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertSkillsRepository = dataSource.getRepository(ExpertSkill);

    const newExert = expertRepository.create({
      fullName,
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
  static getExpertInfoByAccessToken = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertInfo = await expertRepository.findOne({
      relations: {
        certifications: true,
        experiences: true,
        educations: true,
        expertSkills: {
          skill: true,
        },
      },
      where: {
        userId,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }
    expertInfo.certifications.sort(
      (a: ExpertCertification, b: ExpertCertification) =>
        new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    );
    expertInfo.experiences.sort(
      (a: ExpertExperience, b: ExpertExperience) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    expertInfo.educations.sort(
      (a: ExpertEducation, b: ExpertEducation) => a.startYear - b.startYear
    );
    return expertInfo;
  };
  static getExpertInfoByUserId = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { dataSource } = req.app.locals;
    const { userId } = req.params;
    if (!userId) {
      throw new BadRequestError(EXPERT_MESSAGES.USER_ID_REQUIRED);
    }

    const expertRepository = dataSource.getRepository(Expert);
    const expertInfo = await expertRepository.findOne({
      relations: {
        certifications: true,
        experiences: true,
        educations: true,
        expertSkills: {
          skill: true,
        },
      },
      where: {
        userId: userId.toString(),
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }
    expertInfo.certifications.sort(
      (a: ExpertCertification, b: ExpertCertification) =>
        new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    );
    expertInfo.experiences.sort(
      (a: ExpertExperience, b: ExpertExperience) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    expertInfo.educations.sort(
      (a: ExpertEducation, b: ExpertEducation) => a.startYear - b.startYear
    );
    return expertInfo;
  };
  // static filterExpert = async (req: Request) => {
  //   const {
  //     page,
  //     limit,
  //     search,
  //     experiences,
  //     mainSkills,
  //     sortBy = "fullName",
  //     orderBy = "ASC",
  //   } = req.query;
  //   const { dataSource } = req.app.locals;
  //   const expertRepository = dataSource.getRepository(Expert);
  //   let criteria: FindManyOptions<Expert> = {
  //     relations: {
  //       expertSkills: {
  //         skill: true,
  //       },
  //     },
  //     skip: limit && page ? Number(limit) * (Number(page) - 1) : undefined,
  //     take: limit && page ? Number(limit) : undefined,
  //     where: {},
  //     order: {
  //       [sortBy as string]: orderBy,
  //     },
  //   };
  //   if (search) {
  //     criteria.where = {
  //       ...criteria.where,
  //       fullName: ILike(`%${search}%`),
  //     };
  //   }
  //   if (experiences) {
  //     criteria.where = {
  //       ...criteria.where,
  //       experience_years: Number(experiences),
  //     };
  //   }
  //   if (mainSkills) {
  //     criteria.where = {
  //       ...criteria.where,
  //       expertSkills: {
  //         skillId: In(mainSkills.toString().split("|")),
  //       },
  //     };
  //   }

  //   const experts = await expertRepository.find(criteria);
  //   const users = await Promise.all(
  //     experts.map((ex: Expert) => {
  //       return UserService.checkUserExisted({
  //         userId: ex.userId as string,
  //       });
  //     })
  //   );
  //   // ✅ Map appointments with user info
  //   const result = experts.map((ex: Expert, index: number) => ({
  //     ...ex,
  //     user: users[index],
  //   }));

  //   return {
  //     page: page ? Number(page) : 1,
  //     limit: limit ? Number(limit) : 10,
  //     total_items: experts.length,
  //     total_pages: Math.ceil(experts.length / (limit ? Number(limit) : 10)),
  //     experts: result,
  //   };
  // };
  static filterExpert = async (req: Request) => {
    const {
      page = 1,
      limit = 10,
      search,
      experiences,
      mainSkills,
      sortBy = "fullName",
      orderBy = "ASC",
    } = req.query;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);

    const query = expertRepository
      .createQueryBuilder("expert")
      .leftJoinAndSelect("expert.expertSkills", "expertSkill")
      .leftJoinAndSelect("expertSkill.skill", "skill")
      .skip(Number(limit) * (Number(page) - 1))
      .take(Number(limit))
      .orderBy(`expert.${sortBy}`, orderBy === "ASC" ? "ASC" : "DESC");

    if (search) {
      query.andWhere("expert.fullName ILIKE :search", {
        search: `%${search}%`,
      });
    }

    if (experiences) {
      query.andWhere("expert.experience_years = :experiences", { experiences });
    }

    if (mainSkills) {
      const skillsArray = mainSkills.toString().split("|");

      // Use subquery to filter experts who have at least one of the selected skills
      query.andWhere(
        (qb: any) =>
          `expert.id IN (${qb
            .subQuery()
            .select("expertSkill.expertId")
            .from(ExpertSkill, "expertSkill")
            .where("expertSkill.skillId IN (:...skillsArray)", { skillsArray })
            .getQuery()})`
      );
    }

    const [experts, total] = await query.getManyAndCount();

    const users = await Promise.all(
      experts.map((ex: Expert) =>
        UserService.checkUserExisted({
          userId: ex.userId as string,
        })
      )
    );

    // ✅ Ensure all skills of the expert are included
    const result = experts.map((ex: Expert, index: number) => ({
      ...ex,
      user: users[index],
    }));

    return {
      page: Number(page),
      limit: Number(limit),
      total_items: total,
      total_pages: Math.ceil(total / Number(limit)),
      experts: result,
    };
  };
}
