import { Request, Response } from "express";
import { CreateExpertUserBody } from "../requests/expert.requests";
import { Expert } from "../entities/Expert";
import { ExpertSkill } from "../entities/ExpertSkill";
import { ExpertCertification } from "../entities/ExpertCertification";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import {
  EXPERT_AVAILABILITY_MESSAGES,
  EXPERT_MESSAGES,
} from "../../common/messages/index.messages";
import { ExpertExperience } from "../entities/ExpertExperience";
import { ExpertEducation } from "../entities/ExpertEducation";
import UserService from "../../services/user.services";
import { ExpertAvailabilityTypeRequest } from "../../common/constants/expert-availability.enum";
import { ExpertAvailability } from "../entities/ExpertAvailability";
import {
  Between,
  FindManyOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import { getDaysInMonth } from "../../utils";
import { Appointment } from "../entities/Appointments";

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

    // ✅ ONE_MONTH: Add availability for every Monday (or given day) in the selected month
    if (type === ExpertAvailabilityTypeRequest.ONE_MONTH) {
      let currentDate = new Date(year, month, dateTemp); // Start from the 1st of the month

      while (currentDate.getMonth() === month) {
        if (currentDate.getDay() === dayOfWeek) {
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
          const overlappingAvailability =
            await expertAvailabilityRepository.findOne({
              where: {
                expert: { id: expert.id },
                date: new Date(currentDate),
                startTime: LessThanOrEqual(endTimeTemp),
                endTime: MoreThanOrEqual(startTimeTemp),
              },
            });

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
          const overlappingAvailability =
            await expertAvailabilityRepository.findOne({
              where: {
                expert: { id: expert.id },
                date: new Date(firstDayOfMonth),
                startTime: LessThanOrEqual(endTimeTemp),
                endTime: MoreThanOrEqual(startTimeTemp),
              },
            });

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
  static getExpertScheduleForUser = async (req: Request) => {
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
}
