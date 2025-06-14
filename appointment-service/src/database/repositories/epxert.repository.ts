import { Request, Response } from "express";
import {
  CreateCertificateBody,
  CreateEducationBody,
  CreateExperienceBody,
  CreateExpertUserBody,
  DeleteCertificatesBody,
  DeleteEducationBody,
  DeleteExperiencesBody,
  UpdateCertificateBody,
  UpdateEducationBody,
  UpdateExperienceBody,
  UpdateExpertSkillsBody,
  UpdateExpertUserBody,
  UpdateLanguagesBody,
} from "../requests/expert.requests";
import { Expert } from "../entities/Expert";
import { ExpertSkill } from "../entities/ExpertSkill";
import { ExpertCertification } from "../entities/ExpertCertification";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import {
  EXPERT_AVAILABILITY_MESSAGES,
  EXPERT_MESSAGES,
} from "../../common/messages/index.messages";
import { ExpertExperience } from "../entities/ExpertExperience";
import { DegreeType, ExpertEducation } from "../entities/ExpertEducation";
import UserService from "../../services/user.services";
import { ExpertAvailabilityTypeRequest } from "../../common/constants/expert-availability.enum";
import { ExpertAvailability } from "../entities/ExpertAvailability";
import {
  Between,
  FindManyOptions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
} from "typeorm";
import { getDaysInMonth, pick } from "../../utils";
import { Appointment, AppointmentStatus } from "../entities/Appointments";
import { SystemRole } from "../../utils/enums";
import { Skill } from "../entities/Skill";

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
        isMainSkill: true,
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

    const userTemp = await UserService.checkUserExisted({
      userId: expertInfo.userId,
    })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
        return null;
      });

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
    return {
      ...expertInfo,
      user: userTemp
        ? pick(userTemp, [
            "_id",
            "fullName",
            "email",
            "phoneNumber",
            "date_of_birth",
            "gender",
            "username",
            "avatar",
          ])
        : null,
    };
  };
  static checkExpertExistByUserId = async ({
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
  static updateExpertGeneralInfo = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_UPDATE_THIS_EXPERT
        );
      }
    }

    const {
      fullName,
      specialization,
      experience_years,
      bio,
      consultation_fee,
      languages,
    } = req.body as UpdateExpertUserBody;
    expertRepository.merge(expertInfo, {
      fullName,
      specialization,
      experience_years,
      bio,
      consultation_fee,
      languages,
      updatedBy: userId,
    });
    await expertRepository.save(expertInfo);

    if (fullName) {
      // Update user profile if fullName is provided
      await UserService.updateUserProfileInternal({
        userId: expertInfo.userId,
        fullName,
      });
    }
    return expertInfo;
  };
  static updateExpertGeneralInfoInternal = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { userId } = req.params;
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertInfo = await expertRepository.findOne({
      where: {
        userId: userId.toString(),
      },
    });
    if (!expertInfo) {
      return null; // If expert not found, return null
    }

    const { fullName } = req.body;
    expertRepository.merge(expertInfo, {
      fullName,
    });
    await expertRepository.save(expertInfo);

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

    const userTemp = await UserService.checkUserExisted({
      userId: expertInfo.userId,
    })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
        return null;
      });
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

    return {
      ...expertInfo,
      user: userTemp
        ? pick(userTemp, [
            "_id",
            "fullName",
            "email",
            "phoneNumber",
            "date_of_birth",
            "gender",
            "username",
            "avatar",
          ])
        : null,
    };
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
      sort_by = "fullName",
      order_by = "ASC",
    } = req.query;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);

    const query = expertRepository
      .createQueryBuilder("expert")
      .leftJoinAndSelect("expert.expertSkills", "expertSkill")
      .leftJoinAndSelect("expertSkill.skill", "skill")
      .skip(Number(limit) * (Number(page) - 1))
      .take(Number(limit))
      .orderBy(`expert.${sort_by}`, order_by === "ASC" ? "ASC" : "DESC");

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

  static async createAvailabilities({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) {
    const { user } = res.locals.session;
    const { user_id: userId, expert_id: expertId } = user;
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);
    const expert = await expertRepository.findOne({
      where: {
        userId,
      },
    });
    if (!expert) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }
    const { availability, type } = req.body;
    // type is attribute to know that the availability is available in one month or every month

    const { date, startTime, endTime } = availability;

    // ✅ Ensure valid date and time
    const startDate = new Date(`${date}T${startTime}:00.000Z`);
    const endDate = new Date(`${date}T${endTime}:00.000Z`);

    if (startDate >= endDate) {
      throw new BadRequestError(
        EXPERT_AVAILABILITY_MESSAGES.START_DATE_MUST_BE_EQUAL_OR_BEFORE_END_DATE
      );
    }

    const newAvailabilities: ExpertAvailability[] = [];
    const currentYear = new Date().getFullYear(); // Get current year dynamically

    // ✅ Convert to Date format
    const selectedDate = new Date(date);
    const dateTemp = selectedDate.getDate(); // 1 = 1st, 2 = 2nd, ..., 31 = 31st
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // ✅ ONE_DAY: Add availability for a specific day
    if (type === ExpertAvailabilityTypeRequest.ONE_DAY) {
      const startTimeTemp = new Date(
        year,
        month,
        dateTemp,
        startTime.split(":")[0],
        startTime.split(":")[1],
        0,
        0
      );
      const endTimeTemp = new Date(
        year,
        month,
        dateTemp,
        endTime.split(":")[0],
        endTime.split(":")[1],
        0,
        0
      );
      // ✅ Check for overlapping schedules
      const [overlappingAvailability, previousAvailability] = await Promise.all(
        [
          expertAvailabilityRepository.findOne({
            where: {
              expert: { id: expert.id },
              date: new Date(selectedDate),
              startTime: LessThanOrEqual(endTimeTemp),
              endTime: MoreThanOrEqual(startTimeTemp),
            },
          }),
          expertAvailabilityRepository.findOne({
            where: {
              expert: { id: expert.id },
              date: new Date(selectedDate),
              endTime: LessThanOrEqual(startTimeTemp),
            },
            order: {
              endTime: "DESC",
            },
          }),
        ]
      );

      if (overlappingAvailability) {
        throw new BadRequestError(
          EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_EXISTED +
            `: ${overlappingAvailability.startTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${overlappingAvailability.startTime
              .getMinutes()
              .toString()
              .padStart(2, "0")} - ${overlappingAvailability.endTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${overlappingAvailability.endTime
              .getMinutes()
              .toString()
              .padStart(2, "0")} ${overlappingAvailability.date} is overlapping`
        );
      }
      // Check previous availability distance 30 minutes

      if (previousAvailability) {
        const previousEndTime = new Date(previousAvailability.endTime);
        const timeDifference =
          startTimeTemp.getTime() - previousEndTime.getTime();
        if (timeDifference < 30 * 60 * 1000) {
          throw new BadRequestError(
            EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_SHOULD_BE_30_MINUTES_THAN_PREVIOUS +
              `: ${previousAvailability.startTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${previousAvailability.startTime
                .getMinutes()
                .toString()
                .padStart(2, "0")} - ${previousAvailability.endTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${previousAvailability.endTime
                .getMinutes()
                .toString()
                .padStart(2, "0")} ${previousAvailability.date}`
          );
        }
      }

      newAvailabilities.push(
        expertAvailabilityRepository.create({
          date: new Date(selectedDate),
          startTime: startTimeTemp,
          endTime: endTimeTemp,
          expert,
          isAvailable: true,
          createdBy: userId,
        })
      );
    }

    // ✅ ONE_MONTH: Add availability for every Monday (or given day) in the selected month
    if (type === ExpertAvailabilityTypeRequest.ONE_MONTH) {
      let currentDate = new Date(year, month, dateTemp); // Start from the 1st of the month

      while (currentDate.getMonth() === month) {
        if (currentDate.getDay() === dayOfWeek) {
          const startTimeTemp = new Date(
            year,
            month,
            currentDate.getDate(),
            startTime.split(":")[0],
            startTime.split(":")[1],
            0,
            0
          );
          const endTimeTemp = new Date(
            year,
            month,
            currentDate.getDate(),
            endTime.split(":")[0],
            endTime.split(":")[1],
            0,
            0
          );
          // ✅ Check for overlapping schedules
          const [overlappingAvailability, previousAvailability] =
            await Promise.all([
              expertAvailabilityRepository.findOne({
                where: {
                  expert: { id: expert.id },
                  date: new Date(currentDate),
                  startTime: LessThanOrEqual(endTimeTemp),
                  endTime: MoreThanOrEqual(startTimeTemp),
                },
              }),
              expertAvailabilityRepository.findOne({
                where: {
                  expert: { id: expert.id },
                  date: new Date(currentDate),
                  endTime: LessThanOrEqual(startTimeTemp),
                },
                order: {
                  endTime: "DESC",
                },
              }),
            ]);

          if (overlappingAvailability) {
            throw new BadRequestError(
              EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_EXISTED +
                `: ${overlappingAvailability.startTime
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${overlappingAvailability.startTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")} - ${overlappingAvailability.endTime
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${overlappingAvailability.endTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")} ${
                  overlappingAvailability.date
                } is overlapping`
            );
          }

          // Check previous availability distance 30 minutes

          if (previousAvailability) {
            const previousEndTime = new Date(previousAvailability.endTime);
            const timeDifference =
              startTimeTemp.getTime() - previousEndTime.getTime();
            if (timeDifference < 30 * 60 * 1000) {
              throw new BadRequestError(
                EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_SHOULD_BE_30_MINUTES_THAN_PREVIOUS +
                  `: ${previousAvailability.startTime
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${previousAvailability.startTime
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")} - ${previousAvailability.endTime
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${previousAvailability.endTime
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")} ${previousAvailability.date}`
              );
            }
          }

          newAvailabilities.push(
            expertAvailabilityRepository.create({
              date: new Date(currentDate),
              startTime: startTimeTemp,
              endTime: endTimeTemp,
              expert,
              isAvailable: true,
              createdBy: userId,
            })
          );
        }
        currentDate.setDate(currentDate.getDate() + 7); // Move to the next day
      }
    }

    // ✅ EVERY_MONTH: Add availability for every Monday in every month until Dec 31
    if (type === ExpertAvailabilityTypeRequest.EVERY_MONTH) {
      let month = selectedDate.getMonth();
      let currentDate = new Date(date);
      const endOfYear = new Date(`${currentYear}-12-31`);

      while (
        currentDate.getFullYear() === currentYear &&
        currentDate <= endOfYear
      ) {
        // Find the first Monday (or given day) in the current month
        let firstDayOfMonth =
          month === selectedDate.getMonth()
            ? new Date(currentYear, month, dateTemp)
            : new Date(currentYear, month, 1);
        while (firstDayOfMonth.getDay() !== dayOfWeek) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }

        // Add every selected day in this month
        while (firstDayOfMonth.getMonth() === month) {
          const startTimeTemp = new Date(
            year,
            firstDayOfMonth.getMonth(),
            firstDayOfMonth.getDate(),
            startTime.split(":")[0],
            startTime.split(":")[1],
            0,
            0
          );
          const endTimeTemp = new Date(
            year,
            firstDayOfMonth.getMonth(),
            firstDayOfMonth.getDate(),
            endTime.split(":")[0],
            endTime.split(":")[1],
            0,
            0
          );
          // ✅ Check for overlapping schedules
          const [overlappingAvailability, previousAvailability] =
            await Promise.all([
              expertAvailabilityRepository.findOne({
                where: {
                  expert: { id: expert.id },
                  date: new Date(firstDayOfMonth),
                  startTime: LessThanOrEqual(endTimeTemp),
                  endTime: MoreThanOrEqual(startTimeTemp),
                },
              }),
              expertAvailabilityRepository.findOne({
                where: {
                  expert: { id: expert.id },
                  date: new Date(firstDayOfMonth),
                  endTime: LessThanOrEqual(startTimeTemp),
                },
                order: {
                  endTime: "DESC",
                },
              }),
            ]);

          if (overlappingAvailability) {
            throw new BadRequestError(
              EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_EXISTED +
                `: ${overlappingAvailability.startTime
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${overlappingAvailability.startTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")} - ${overlappingAvailability.endTime
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${overlappingAvailability.endTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")} ${
                  overlappingAvailability.date
                } is overlapping`
            );
          }

          // Check previous availability distance 30 minutes

          if (previousAvailability) {
            const previousEndTime = new Date(previousAvailability.endTime);
            const timeDifference =
              startTimeTemp.getTime() - previousEndTime.getTime();
            if (timeDifference < 30 * 60 * 1000) {
              throw new BadRequestError(
                EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_SHOULD_BE_30_MINUTES_THAN_PREVIOUS +
                  `: ${previousAvailability.startTime
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${previousAvailability.startTime
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")} - ${previousAvailability.endTime
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${previousAvailability.endTime
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")} ${previousAvailability.date}`
              );
            }
          }

          newAvailabilities.push(
            expertAvailabilityRepository.create({
              date: new Date(firstDayOfMonth),
              startTime: startTimeTemp,
              endTime: endTimeTemp,
              expert,
              isAvailable: true,
              createdBy: userId,
            })
          );
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 7); // Move to next Monday
        }

        // Move to the next month
        month += 1;
        currentDate.setMonth(month);
      }
    }

    await expertAvailabilityRepository.save(newAvailabilities);
    return null;
  }
  static getExpertAvailabilityById = async (req: Request) => {
    const { expertId } = req.params;
    const { month, year, isAvailable } = req.query;
    const { dataSource } = req.app.locals;
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);
    const expertRepository = dataSource.getRepository(Expert);
    const expert = await expertRepository.findOne({
      where: {
        id: expertId,
      },
    });
    if (!expert) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    const criteria: FindManyOptions<ExpertAvailability> = {
      relations: {},
      where: {
        expert: { id: expertId },
      },
      order: {
        date: "ASC",
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        isAvailable: true,
      },
    };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      criteria.where = {
        ...criteria.where,
        date: Between(startDate, endDate),
      };
    }
    if (isAvailable !== undefined) {
      criteria.where = {
        ...criteria.where,
        isAvailable: isAvailable === "true",
      };
    }
    const availabilities = await expertAvailabilityRepository.find(criteria);
    const numberOfDaysInSelectedMonth = getDaysInMonth(
      Number(year),
      Number(month)
    );
    const availabilitiesMap = new Map();

    // Init empty array for each day of month
    for (let day: number = 2; day <= numberOfDaysInSelectedMonth + 1; day++) {
      const date = new Date(Number(year), Number(month) - 1, day);
      const formattedDate = date.toISOString().split("T")[0];
      availabilitiesMap.set(formattedDate, []);
    }

    // Find Appointment Id for unavailable slots
    const temp = await Promise.all(
      availabilities.map(async (availability: ExpertAvailability) => {
        let appointment = null;
        let user = null;
        if (!availability.isAvailable) {
          const appointmentTmp = await dataSource
            .getRepository(Appointment)
            .findOne({
              relations: {},
              where: {
                available: {
                  id: availability.id,
                },
              },
            });
          appointment = appointmentTmp;
          if (appointmentTmp?.userId) {
            const userTmp = await UserService.checkUserExisted({
              userId: appointmentTmp?.userId,
            });
            user = pick(userTmp, [
              "_id",
              "fullName",
              "email",
              "gender",
              "username",
              "avatar",
            ]);
          }
        }
        return {
          ...availability,
          appointment: !appointment
            ? null
            : {
                ...appointment,
                user: user,
              },
        };
      })
    );

    temp.forEach((availability: any) => {
      const formattedDate = new Date(availability.date)
        .toISOString()
        .split("T")[0];
      const current = availabilitiesMap.get(formattedDate) || [];
      availabilitiesMap.set(formattedDate, [...current, availability]);
    });
    const result = Array.from(availabilitiesMap, ([date, slots]) => ({
      date,
      slots,
    }));
    return result;
  };
  static getExpertScheduleForUser = async (req: Request) => {
    console.log("getExpertScheduleForUser called");
    const { expertId } = req.params;
    const { month, year } = req.query;
    const { dataSource } = req.app.locals;
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);
    const expertRepository = dataSource.getRepository(Expert);
    const expert = await expertRepository.findOne({
      where: {
        id: expertId,
      },
    });
    if (!expert) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    const criteria: FindManyOptions<ExpertAvailability> = {
      relations: {},
      where: {
        expert: { id: expertId },
      },
      order: {
        date: "ASC",
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        isAvailable: true,
      },
    };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      criteria.where = {
        ...criteria.where,
        date: Between(startDate, endDate),
      };
    }

    const availabilities = await expertAvailabilityRepository.find(criteria);
    const numberOfDaysInSelectedMonth = getDaysInMonth(
      Number(year),
      Number(month)
    );
    const availabilitiesMap = new Map();

    // Init empty array for each day of month
    for (let day: number = 2; day <= numberOfDaysInSelectedMonth + 1; day++) {
      const date = new Date(Number(year), Number(month) - 1, day);
      const formattedDate = date.toISOString().split("T")[0];
      availabilitiesMap.set(formattedDate, []);
    }

    // Find Appointment Id for unavailable slots
    const temp = await Promise.all(
      availabilities.map(async (availability: ExpertAvailability) => {
        let appointmentId = null;
        if (!availability.isAvailable) {
          const appointment = await dataSource
            .getRepository(Appointment)
            .findOne({
              where: {
                available: {
                  id: availability.id,
                },
              },
              select: {
                id: true,
              },
            });
          appointmentId = appointment?.id;
        }
        return {
          ...availability,
          appointmentId,
        };
      })
    );

    temp.forEach((availability: any) => {
      const formattedDate = new Date(availability.date)
        .toISOString()
        .split("T")[0];
      availabilitiesMap.set(formattedDate, [
        ...availabilitiesMap.get(formattedDate),
        availability,
      ]);
    });
    const result = Array.from(availabilitiesMap, ([date, slots]) => ({
      date,
      slots,
    }));
    return result;
  };
  static getAllExpertScheduleInSpecificDayForUser = async (req: Request) => {
    console.log("getAllExpertScheduleInSpecificDayForUser called");
    const { month, year, day, mainSkills } = req.query;
    const { dataSource } = req.app.locals;
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);

    const criteria: FindManyOptions<ExpertAvailability> = {
      relations: {
        expert: {
          expertSkills: {
            skill: true,
          },
        },
      },
      order: {
        date: "ASC",
        startTime: "ASC",
      },
      // select: {
      //   id: true,
      //   date: true,
      //   startTime: true,
      //   endTime: true,
      //   isAvailable: true,
      //   expert:true
      // },
    };

    if (mainSkills) {
      criteria.where = {
        ...criteria.where,
        expert: {
          expertSkills: {
            skillId: In(mainSkills.toString().split("|")),
          },
        },
      };
    }

    if (month && year && day) {
      // const startDate = new Date(Number(year), Number(month) - 1, 1);
      // const endDate = new Date(Number(year), Number(month), 0);
      const dayNum = Number(day);
      const monthNum = Number(month) - 1;
      const yearNum = Number(year);

      const startDate = new Date(yearNum, monthNum, dayNum, 0, 0, 0, 0);
      const endDate = new Date(yearNum, monthNum, dayNum, 23, 59, 59, 999);

      criteria.where = {
        ...criteria.where,
        date: Between(startDate, endDate),
      };
    }

    const availabilities = await expertAvailabilityRepository.find(criteria);
    // Nhóm theo expert
    const expertMap = new Map();

    for (const availability of availabilities) {
      const { expert, ...schedule } = availability;

      if (!expertMap.has(expert!.id)) {
        expertMap.set(expert!.id, {
          ...expert,
          schedules: [],
        });
      }

      expertMap.get(expert!.id).schedules.push(schedule);
    }

    const result = Array.from(expertMap.values());

    return result;
  };

  static updateAvailability = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const { user_id: userId, expert_id: expertId } = user;
    const { id } = req.params;
    const { dataSource } = req.app.locals;
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);

    if (!id) {
      throw new BadRequestError(EXPERT_AVAILABILITY_MESSAGES.ID_REQUIRED);
    }

    const expertAvailability = await expertAvailabilityRepository.findOne({
      relations: {
        expert: true,
      },
      where: {
        id,
      },
    });
    if (!expertAvailability) {
      throw new NotFoundError(
        EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_NOT_FOUND
      );
    }

    if (expertAvailability?.expert?.id !== expertId) {
      throw new BadRequestError(
        EXPERT_AVAILABILITY_MESSAGES.NOT_PERMISSION_TO_UPDATE_THIS_AVAILABILITY
      );
    }

    if (!expertAvailability.isAvailable) {
      throw new BadRequestError(
        EXPERT_AVAILABILITY_MESSAGES.UPDATE_FAILED_SLOT_IS_PICKED
      );
    }
    const { date, startTime, endTime } = req.body;
    // ✅ Ensure valid date and time
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    // ✅ Convert to Date format
    const selectedDate = new Date(date);
    const dateTemp = selectedDate.getDate(); // 1 = 1st, 2 = 2nd, ..., 31 = 31st
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    if (startDate >= endDate) {
      throw new BadRequestError(
        EXPERT_AVAILABILITY_MESSAGES.START_DATE_MUST_BE_EQUAL_OR_BEFORE_END_DATE
      );
    }

    const startTimeTemp = new Date(
      year,
      month,
      dateTemp,
      startDate.getHours(),
      startDate.getMinutes(),
      0,
      0
    );
    const endTimeTemp = new Date(
      year,
      month,
      dateTemp,
      endDate.getHours(),
      endDate.getMinutes(),
      0,
      0
    );

    // ✅ Check for overlapping schedules
    const [overlappingAvailability, previousAvailability] = await Promise.all([
      expertAvailabilityRepository.findOne({
        where: {
          expert: { id: expertId },
          id: Not(id), // Exclude the current availability being updated
          date: new Date(selectedDate),
          startTime: LessThanOrEqual(endTimeTemp),
          endTime: MoreThanOrEqual(startTimeTemp),
        },
      }),
      expertAvailabilityRepository.findOne({
        where: {
          expert: { id: expertId },
          id: Not(id), // Exclude the current availability being updated
          date: new Date(selectedDate),
          endTime: LessThanOrEqual(startTimeTemp),
        },
        order: {
          endTime: "DESC",
        },
      }),
    ]);

    if (overlappingAvailability) {
      throw new BadRequestError(
        EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_EXISTED +
          `: ${overlappingAvailability.startTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${overlappingAvailability.startTime
            .getMinutes()
            .toString()
            .padStart(2, "0")} - ${overlappingAvailability.endTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${overlappingAvailability.endTime
            .getMinutes()
            .toString()
            .padStart(2, "0")} ${overlappingAvailability.date} is overlapping`
      );
    }
    // Check previous availability distance 30 minutes

    if (previousAvailability) {
      const previousEndTime = new Date(previousAvailability.endTime);
      const timeDifference =
        startTimeTemp.getTime() - previousEndTime.getTime();
      if (timeDifference < 30 * 60 * 1000) {
        throw new BadRequestError(
          EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_SHOULD_BE_30_MINUTES_THAN_PREVIOUS +
            `: ${previousAvailability.startTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${previousAvailability.startTime
              .getMinutes()
              .toString()
              .padStart(2, "0")} - ${previousAvailability.endTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${previousAvailability.endTime
              .getMinutes()
              .toString()
              .padStart(2, "0")} ${previousAvailability.date}`
        );
      }
    }

    expertAvailabilityRepository.merge(expertAvailability, {
      date,
      startTime,
      endTime,
      updatedBy: userId,
    });
    await expertAvailabilityRepository.save(expertAvailability);
    return expertAvailability;
  };
  static deleteAvailability = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const { user_id: userId, expert_id: expertId } = user;
    const { id } = req.params;
    const { dataSource } = req.app.locals;
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);

    if (!id) {
      throw new BadRequestError(EXPERT_AVAILABILITY_MESSAGES.ID_REQUIRED);
    }

    const expertAvailability = await expertAvailabilityRepository.findOne({
      relations: {
        expert: true,
      },
      where: {
        id,
      },
    });
    if (!expertAvailability) {
      throw new NotFoundError(
        EXPERT_AVAILABILITY_MESSAGES.AVAILABILITY_NOT_FOUND
      );
    }

    if (expertAvailability?.expert?.id !== expertId) {
      throw new BadRequestError(
        EXPERT_AVAILABILITY_MESSAGES.NOT_PERMISSION_TO_DELETE_THIS_AVAILABILITY
      );
    }

    if (!expertAvailability.isAvailable) {
      throw new BadRequestError(EXPERT_AVAILABILITY_MESSAGES.DELETE_FAILED);
    }
    await expertAvailabilityRepository.remove(expertAvailability);
    return null;
  };
  static getExpertStatistic = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const { user_id: userId, expert_id: expertId } = user;
    const { dataSource } = req.app.locals;
    const appointmentRepository = dataSource.getRepository(Appointment);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date();
    endOfLastMonth.setMonth(endOfLastMonth.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const endOfThisMonth = new Date();
    endOfThisMonth.setMonth(endOfThisMonth.getMonth() + 1, 0);
    endOfThisMonth.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Raw query to get the total number of patients in the last month
    const queryGetTotalPatientLastMonth = appointmentRepository
      .createQueryBuilder("appointments")
      .select("appointments.userId", "userId") // Chọn trường userId
      .addSelect("COUNT(appointments.id)", "count") // Đếm số lượng
      .where("appointments.expertId = :expertId", { expertId }) // Điều kiện expert.id
      .andWhere("appointments.status = :status", {
        status: AppointmentStatus.COMPLETED,
      }) // Điều kiện status
      .andWhere("appointments.createdAt BETWEEN :start AND :end", {
        start: startOfLastMonth,
        end: endOfLastMonth,
      }) // Điều kiện createdAt
      .groupBy("appointments.userId");

    const queryGetTotalPatientThisMonth = appointmentRepository
      .createQueryBuilder("appointments")
      .select("appointments.userId", "userId") // Chọn trường userId
      .addSelect("COUNT(appointments.id)", "count") // Đếm số lượng
      .where("appointments.expertId = :expertId", { expertId }) // Điều kiện expert.id
      .andWhere("appointments.status = :status", {
        status: AppointmentStatus.COMPLETED,
      }) // Điều kiện status
      .andWhere("appointments.createdAt BETWEEN :start AND :end", {
        start: startOfThisMonth,
        end: endOfThisMonth,
      }) // Điều kiện createdAt
      .groupBy("appointments.userId");

    const [
      totalYesterDayAppointments,
      totalTodayAppointments,
      totalPendingAppointmentsLastMonth,
      totalPendingAppointmentsThisMonth,
      totalPatientsLastMonth,
      totalPatientsThisMonth,
      totalCompleteAppointmentsLastMonth,
      totalCompleteAppointmentsThisMonth,
    ] = await Promise.all([
      appointmentRepository.count({
        where: {
          expert: {
            id: expertId,
          },
          createdAt: Between(startOfYesterday, startOfYesterday),
        },
      }),
      appointmentRepository.count({
        where: {
          expert: {
            id: expertId,
          },
          createdAt: Between(startOfToday, endOfToday),
        },
      }),
      appointmentRepository.count({
        where: {
          expert: {
            id: expertId,
          },
          status: AppointmentStatus.PENDING,
          createdAt: Between(startOfLastMonth, endOfLastMonth),
        },
      }),
      appointmentRepository.count({
        where: {
          expert: {
            id: expertId,
          },
          status: AppointmentStatus.PENDING,
          createdAt: Between(startOfThisMonth, endOfThisMonth),
        },
      }),
      queryGetTotalPatientLastMonth.getCount(),
      queryGetTotalPatientThisMonth.getCount(),
      appointmentRepository.count({
        where: {
          expert: {
            id: expertId,
          },
          status: AppointmentStatus.COMPLETED,
          createdAt: Between(startOfLastMonth, endOfLastMonth),
        },
      }),
      appointmentRepository.count({
        where: {
          expert: {
            id: expertId,
          },
          status: AppointmentStatus.COMPLETED,
          createdAt: Between(startOfThisMonth, endOfThisMonth),
        },
      }),
    ]);

    return {
      totalYesterDayAppointments,
      totalTodayAppointments,
      totalPendingAppointmentsLastMonth,
      totalPendingAppointmentsThisMonth,
      totalPatientsLastMonth,
      totalPatientsThisMonth,
      totalCompleteAppointmentsLastMonth,
      totalCompleteAppointmentsThisMonth,
    };
  };

  static addNewCertification = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertCertificationRepository =
      dataSource.getRepository(ExpertCertification);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_ADD_CERTIFICATION
        );
      }
    }

    const {
      name,
      issuingOrganization,
      issueDate,
      expirationDate,
      credentialUrl,
    } = req.body as CreateCertificateBody;

    const newCertification = expertCertificationRepository.create({
      name,
      issuingOrganization,
      issueDate,
      expirationDate,
      credentialUrl,
      expert: expertInfo,
    });
    const result = await expertCertificationRepository.save(newCertification);

    return result;
  };
  static updateCertification = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id, certificationId } = req.params;
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertCertificationRepository =
      dataSource.getRepository(ExpertCertification);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_UPDATE_CERTIFICATION
        );
      }
    }

    //Check if the certification exists
    const certification = await expertCertificationRepository.findOne({
      where: {
        id: certificationId,
        expert: {
          id,
        },
      },
    });

    if (!certification) {
      throw new NotFoundError(EXPERT_MESSAGES.CERTIFICATION_NOT_FOUND);
    }

    const {
      name,
      issuingOrganization,
      issueDate,
      expirationDate,
      credentialUrl,
    } = req.body as UpdateCertificateBody;

    expertCertificationRepository.merge(certification, {
      name,
      issuingOrganization,
      issueDate,
      expirationDate,
      credentialUrl,
    });
    const result = await expertCertificationRepository.save(certification);
    return result;
  };
  static deleteCertifications = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { certificationIds } = req.body as DeleteCertificatesBody;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertCertificationRepository =
      dataSource.getRepository(ExpertCertification);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_DELETE_CERTIFICATION
        );
      }
    }

    //Check if the certification exists
    const certification = await expertCertificationRepository.find({
      where: {
        id: In(certificationIds),
        expert: {
          id,
        },
      },
    });
    if (certification.length !== certificationIds.length) {
      throw new NotFoundError(EXPERT_MESSAGES.CERTIFICATION_NOT_FOUND);
    }

    // Delete the certifications
    await expertCertificationRepository.remove(certification);
  };
  static updateExpertLanguages = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);

    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_UPDATE_LANGUAGES
        );
      }
    }
    const { languages } = req.body as UpdateLanguagesBody;
    if (!languages || languages.length === 0) {
      throw new BadRequestError(EXPERT_MESSAGES.LANGUAGES_REQUIRED);
    }

    expertRepository.merge(expertInfo, {
      languages,
    });
    await expertRepository.save(expertInfo);
    return expertInfo;
  };
  static updateExpertSkills = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertSkillsRepository = dataSource.getRepository(ExpertSkill);
    const skillsRepository = dataSource.getRepository(Skill);

    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_UPDATE_LANGUAGES
        );
      }
    }
    const { skills } = req.body as UpdateExpertSkillsBody;
    if (!skills || skills.length === 0) {
      throw new BadRequestError(EXPERT_MESSAGES.SKILLS_REQUIRED);
    }

    // Check if the skills exist
    const skillExist = await skillsRepository.find({
      where: {
        id: In(skills.map((skill) => skill.id)),
      },
    });

    if (skillExist.length !== skills.length) {
      throw new NotFoundError(EXPERT_MESSAGES.SKILL_NOT_FOUND);
    }

    const expertSkills = skills.map(
      (skill: { id: string; isMainSkill: boolean }) => {
        return expertSkillsRepository.create({
          expertId: expertInfo.id,
          skillId: skill.id,
          isMainSkill: skill.isMainSkill,
        });
      }
    );
    await expertSkillsRepository.delete({
      expertId: expertInfo.id,
    });
    const result = await expertSkillsRepository.save(expertSkills);

    return result;
  };
  static addNewExperiences = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertExperienceRepository =
      dataSource.getRepository(ExpertExperience);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_ADD_NEW_EXPERIENCE
        );
      }
    }
    const { company, position, description, startDate, endDate } =
      req.body as CreateExperienceBody;
    if (!company) {
      throw new BadRequestError(EXPERT_MESSAGES.COMPANY_REQUIRED);
    }
    if (!position) {
      throw new BadRequestError(EXPERT_MESSAGES.POSITION_REQUIRED);
    }
    if (!startDate) {
      throw new BadRequestError(EXPERT_MESSAGES.START_DATE_REQUIRED);
    }
    const newExperience = expertExperienceRepository.create({
      company,
      position,
      description,
      startDate,
      endDate,
      expert: expertInfo,
    });
    const result = await expertExperienceRepository.save(newExperience);
    return result;
  };
  static updateExperiences = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id, experienceId } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertExperienceRepository =
      dataSource.getRepository(ExpertExperience);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_UPDATE_EXPERIENCE
        );
      }
    }
    //Check if the experience exists
    const experience = await expertExperienceRepository.findOne({
      where: {
        id: experienceId,
        expert: {
          id,
        },
      },
    });
    if (!experience) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERIENCE_NOT_FOUND);
    }
    const { company, position, description, startDate, endDate } =
      req.body as UpdateExperienceBody;
    if (!company) {
      throw new BadRequestError(EXPERT_MESSAGES.COMPANY_REQUIRED);
    }
    if (!position) {
      throw new BadRequestError(EXPERT_MESSAGES.POSITION_REQUIRED);
    }
    if (!startDate) {
      throw new BadRequestError(EXPERT_MESSAGES.START_DATE_REQUIRED);
    }
    expertExperienceRepository.merge(experience, {
      company,
      position,
      description,
      startDate,
      endDate,
    });
    const result = await expertExperienceRepository.save(experience);
    return result;
  };
  static deleteExperiences = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertExperienceRepository =
      dataSource.getRepository(ExpertExperience);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_DELETE_EXPERIENCE
        );
      }
    }
    const { experienceIds } = req.body as DeleteExperiencesBody;
    // Check if the experienceIds is empty
    if (!experienceIds || experienceIds.length === 0) {
      throw new BadRequestError(EXPERT_MESSAGES.EXPERIENCE_IDS_REQUIRED);
    }
    //Check if the experience exists
    const experience = await expertExperienceRepository.find({
      where: {
        id: In(experienceIds),
        expert: {
          id,
        },
      },
    });
    if (experience.length !== experienceIds.length) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERIENCE_NOT_FOUND);
    }
    // Delete the experience
    await expertExperienceRepository.remove(experience);
    return null;
  };
  // --------------------EDUCATION--------------------
  static addNewEducations = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const ExpertEducationRepository = dataSource.getRepository(ExpertEducation);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_ADD_NEW_EDUCATION
        );
      }
    }
    const { institution, degree, major, startYear, endYear } =
      req.body as CreateEducationBody;
    if (!institution) {
      throw new BadRequestError(EXPERT_MESSAGES.INSTITUTION_REQUIRED);
    }
    if (!degree) {
      throw new BadRequestError(EXPERT_MESSAGES.DEGREE_REQUIRED);
    }
    if (DegreeType[degree] === undefined) {
      throw new BadRequestError(EXPERT_MESSAGES.DEGREE_INVALID);
    }
    if (!major) {
      throw new BadRequestError(EXPERT_MESSAGES.MAJOR_REQUIRED);
    }
    if (!startYear) {
      throw new BadRequestError(EXPERT_MESSAGES.START_YEAR_REQUIRED);
    }
    const newEducation = ExpertEducationRepository.create({
      institution,
      degree,
      major,
      startYear,
      endYear,
      expert: expertInfo,
    });
    const result = await ExpertEducationRepository.save(newEducation);
    return result;
  };
  static updateEducations = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id, educationId } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertEducationRepository = dataSource.getRepository(ExpertEducation);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_UPDATE_EDUCATION
        );
      }
    }
    //Check if the experience exists
    const education = await expertEducationRepository.findOne({
      where: {
        id: educationId,
        expert: {
          id,
        },
      },
    });
    if (!education) {
      throw new NotFoundError(EXPERT_MESSAGES.EDUCATION_NOT_FOUND);
    }
    const { institution, degree, major, startYear, endYear } =
      req.body as UpdateEducationBody;
    if (!institution) {
      throw new BadRequestError(EXPERT_MESSAGES.INSTITUTION_REQUIRED);
    }
    if (!degree) {
      throw new BadRequestError(EXPERT_MESSAGES.DEGREE_REQUIRED);
    }
    if (DegreeType[degree] === undefined) {
      throw new BadRequestError(EXPERT_MESSAGES.DEGREE_INVALID);
    }
    if (!major) {
      throw new BadRequestError(EXPERT_MESSAGES.MAJOR_REQUIRED);
    }
    if (!startYear) {
      throw new BadRequestError(EXPERT_MESSAGES.START_YEAR_REQUIRED);
    }
    expertEducationRepository.merge(education, {
      institution,
      degree,
      major,
      startYear,
      endYear,
    });
    const result = await expertEducationRepository.save(education);
    return result;
  };
  static deleteEducations = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { user } = res.locals.session;
    const userId = user.user_id;
    const role = user.role;
    const { id } = req.params;

    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);
    const expertEducationRepository = dataSource.getRepository(ExpertEducation);
    const expertInfo = await expertRepository.findOne({
      where: {
        id,
      },
    });
    if (!expertInfo) {
      throw new NotFoundError(EXPERT_MESSAGES.EXPERT_NOT_FOUND);
    }

    if (role !== SystemRole.Admin) {
      if (expertInfo.userId !== userId) {
        throw new BadRequestError(
          EXPERT_MESSAGES.NOT_PERMISSION_TO_DELETE_EDUCATION
        );
      }
    }
    const { educationIds } = req.body as DeleteEducationBody;
    // Check if the educationIds is empty
    if (!educationIds || educationIds.length === 0) {
      throw new BadRequestError(EXPERT_MESSAGES.EDUCATION_IDS_REQUIRED);
    }
    //Check if the education exists
    const educations = await expertEducationRepository.find({
      where: {
        id: In(educationIds),
        expert: {
          id,
        },
      },
    });
    if (educations.length !== educationIds.length) {
      throw new NotFoundError(EXPERT_MESSAGES.EDUCATION_NOT_FOUND);
    }
    // Delete the education
    await expertEducationRepository.remove(educations);
    return null;
  };
  static getTop5MostBookedExperts = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);

    const topExperts = await expertRepository
      .createQueryBuilder("expert")
      .leftJoin(
        "expert.appointments",
        "appointment",
        "appointment.status = :status",
        { status: "COMPLETED" }
      )
      .select("expert.id", "id")
      .addSelect("expert.userId", "userId")
      .addSelect("expert.fullName", "fullName")
      .addSelect("COUNT(appointment.id)", "bookingCount")
      .groupBy("expert.id")
      .orderBy('"bookingCount"', "DESC")
      .limit(5)
      .getRawMany();
    if (!topExperts || topExperts.length === 0) {
      return [];
    }
    const result = await Promise.all(
      topExperts.map(async (expert: any) => {
        const user = await UserService.checkUserExisted({
          userId: expert.userId,
        });

        return {
          id: expert.id,
          userId: expert.userId,
          avatar: user?.avatar || "",
          fullName: user?.fullName || "",
          bookingCount: Number(expert.bookingCount),
        };
      })
    );
    return result;
  };
  static getTop5HighestRatingExperts = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { dataSource } = req.app.locals;
    const expertRepository = dataSource.getRepository(Expert);

    const top5HighestRatingExperts = await expertRepository.find({
      order: {
        rating: "DESC",
      },
      take: 5,
    });

    const result = await Promise.all(
      top5HighestRatingExperts.map(async (expert: any) => {
        const user = await UserService.checkUserExisted({
          userId: expert.userId,
        });

        return {
          id: expert.id,
          userId: expert.userId,
          avatar: user?.avatar || "",
          fullName: user?.fullName || "",
          rating: expert.rating,
        };
      })
    );
    return result;
  };
}
