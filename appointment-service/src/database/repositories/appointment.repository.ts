import { Request, Response } from "express";
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  PaymentStatus,
} from "../entities/Appointments";
import { ExpertAvailability } from "../entities/ExpertAvailability";
import { BadRequestError, InternalServerError } from "../../utils/errors";
import { APPOINTMENT_MESSAGES } from "../../common/messages/index.messages";
import UserService from "../../services/user.services";
import { DEFAULT_FEES } from "../../common/constants/index.values";
import {
  Between,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
} from "typeorm";
import { omit } from "../../utils";
import { AppointmentReview } from "../entities/AppointmentReview";
import { ExpertReview } from "../entities/ExpertReview";
import { AppDataSource } from "../data-source";

export default class AppointmentRepository {
  static getAptByUserId = async (req: Request) => {
    const { page, limit, date, month, year } = req.query;
    const userId = req.params.userId;
    const { dataSource } = req.app.locals;
    const appointmentRepository = dataSource.getRepository(Appointment);
    let criteria: FindManyOptions<Appointment> = {
      relations: {
        expert: true,
        available: true,
      },
      skip: limit && page ? Number(limit) * (Number(page) - 1) : undefined,
      take: limit && page ? Number(limit) : undefined,
      select: {
        id: true,
        type: true,
        status: true,
        paymentStatus: true,
        issues: true,
        notes: true,
        fees: true,
        cancellationReason: true,
        canceler: true,
        meetingLink: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        expert: {
          id: true,
          experience_years: true,
          rating: true,
          userId: true,
        },
        available: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      },
      where: {
        userId,
      },
      order: {
        available: {
          startTime: "ASC",
        },
      },
    };

    if (!userId) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.USER_ID_REQUIRED);
    }
    // ✅ Filter by specific date (date, month, year)
    if (date && month && year) {
      const targetDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(date)
      );
      criteria.where = {
        ...criteria.where,
        available: {
          date: targetDate,
        },
      };
    }
    // ✅ Filter by month & year
    else if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      criteria.where = {
        ...criteria.where,
        available: {
          date: Between(startDate, endDate),
        },
      };
    }
    // ✅ Filter by year only
    else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59);
      criteria.where = {
        ...criteria.where,
        available: {
          date: Between(startDate, endDate),
        },
      };
    }
    const appointments = await appointmentRepository.find(criteria);
    const users = await Promise.all(
      appointments.map((apt: Appointment) => {
        return UserService.checkUserExisted({
          userId: apt.expert.userId as string,
        });
      })
    );
    // ✅ Map appointments with user info
    const result = appointments.map((apt: Appointment, index: number) => ({
      id: apt.id,
      date: new Date(apt!.available!.date).toISOString().split("T")[0], // YYYY-MM-DD
      startTime: apt!.available!.startTime,
      endTime: apt!.available!.endTime,
      status: apt.status,
      type: apt.type,
      userId: apt.userId,
      expert: {
        id: apt.expert.id,
        fullName: users[index].fullName,
        gender: users[index].gender,
        username: users[index].username,
        avatar: users[index].avatar,
        experience_years: apt.expert.experience_years,
        rating: apt.expert.rating,
      },
    }));

    return {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      total_items: appointments.length,
      total_pages: Math.ceil(
        appointments.length / (limit ? Number(limit) : 10)
      ),
      appointments: result,
    };
  };
  static getAptByExpertId = async (req: Request) => {
    const { page, limit, date, month, year } = req.query;
    const expertId = req.params.expertId;
    const { dataSource } = req.app.locals;
    const appointmentRepository = dataSource.getRepository(Appointment);
    let criteria: FindManyOptions<Appointment> = {
      relations: {
        expert: true,
        available: true,
      },
      skip: limit && page ? Number(limit) * (Number(page) - 1) : undefined,
      take: limit && page ? Number(limit) : undefined,
      select: {
        id: true,
        type: true,
        status: true,
        paymentStatus: true,
        issues: true,
        notes: true,
        fees: true,
        cancellationReason: true,
        canceler: true,
        meetingLink: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        expert: {
          id: true,
          userId: true,
          experience_years: true,
          rating: true,
        },
        available: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      },
      where: {
        expert: {
          id: expertId,
        },
      },
      order: {
        available: {
          startTime: "ASC",
        },
      },
    };

    if (!expertId) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.EXPERT_ID_REQUIRED);
    }
    // ✅ Filter by specific date (date, month, year)
    if (date && month && year) {
      const targetDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(date)
      );
      criteria.where = {
        ...criteria.where,
        available: {
          date: targetDate,
        },
      };
    }
    // ✅ Filter by month & year
    else if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      criteria.where = {
        ...criteria.where,
        available: {
          date: Between(startDate, endDate),
        },
      };
    }
    // ✅ Filter by year only
    else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59);
      criteria.where = {
        ...criteria.where,
        available: {
          date: Between(startDate, endDate),
        },
      };
    }
    const appointments = await appointmentRepository.find(criteria);
    const users = await Promise.all(
      appointments.map((apt: Appointment) => {
        return UserService.checkUserExisted({
          userId: apt.expert.userId as string,
        });
      })
    );
    // ✅ Map appointments with user info
    const result = appointments.map((apt: Appointment, index: number) => ({
      id: apt.id,
      date: new Date(apt.available!.date).toISOString().split("T")[0], // YYYY-MM-DD
      startTime: apt.available!.startTime,
      endTime: apt.available!.endTime,
      status: apt.status,
      type: apt.type,
      userId: apt.userId,
      expert: {
        id: apt.expert.id,
        fullName: users[index].fullName,
        gender: users[index].gender,
        username: users[index].username,
        avatar: users[index].avatar,
        experience_years: apt.expert.experience_years,
        rating: apt.expert.rating,
      },
    }));

    return {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      total_items: appointments.length,
      total_pages: Math.ceil(
        appointments.length / (limit ? Number(limit) : 10)
      ),
      appointments: result,
    };
  };
  static getAptDetailById = async (req: Request) => {
    const id = req.params.id;
    const { dataSource } = req.app.locals;
    const appointmentRepository = dataSource.getRepository(Appointment);
    let criteria: FindOneOptions<Appointment> = {
      relations: {
        expert: true,
        available: true,
        expertReview: true,
        appointmentReview: true,
      },
      where: {
        id,
      },
    };

    if (!id) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_ID_REQUIRED);
    }

    const appointment = await appointmentRepository.findOne(criteria);

    if (!appointment) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND);
    }

    const [expertUser, user] = await Promise.all([
      UserService.checkUserExisted({
        userId: appointment.expert.userId as string,
      }),
      UserService.checkUserExisted({ userId: appointment.userId }),
    ]);

    // ✅ Map appointments with user info
    const result = {
      id: appointment.id,
      date: new Date(appointment.available!.date).toISOString().split("T")[0], // YYYY-MM-DD
      startTime: appointment.available!.startTime,
      endTime: appointment.available!.endTime,
      status: appointment.status,
      type: appointment.type,
      user: omit(user, [
        "password",
        "email_verify_token",
        "forgot_password_token",
        "otp",
        "workout_plans",
        "meals",
        "waters",
        "challenges",
        "healthTrackings",
        "myNotifySettings",
      ]),
      expert: {
        ...appointment.expert,
        user: omit(expertUser, [
          "password",
          "email_verify_token",
          "forgot_password_token",
          "otp",
          "workout_plans",
          "meals",
          "waters",
          "challenges",
          "healthTrackings",
          "myNotifySettings",
        ]),
      },
      createdBy: appointment.createdBy,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      updatedBy: appointment.updatedBy,
      deletedBy: appointment.deletedBy,
      deletedAt: appointment.deletedAt,
      meetingLink: appointment.meetingLink,
      paymentStatus: appointment.paymentStatus,
      issues: appointment.issues,
      notes: appointment.notes,
      fees: appointment.fees,
      cancellationReason: appointment.cancellationReason,
      canceler: appointment.canceler,
      expertReview: appointment.expertReview,
      appointmentReview: appointment.appointmentReview,
    };

    return {
      appointment: result,
    };
  };
  static getAptByAccessToken = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { page, limit, date, month, year } = req.query;
    const { user } = res.locals.session;
    const userId = user.user_id;
    const { dataSource } = req.app.locals;
    const appointmentRepository = dataSource.getRepository(Appointment);
    let criteria: FindManyOptions<Appointment> = {
      relations: {
        expert: true,
        available: true,
      },
      skip: limit && page ? Number(limit) * (Number(page) - 1) : undefined,
      take: limit && page ? Number(limit) : undefined,
      select: {
        id: true,
        type: true,
        status: true,
        paymentStatus: true,
        issues: true,
        notes: true,
        fees: true,
        cancellationReason: true,
        canceler: true,
        meetingLink: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        expert: {
          id: true,
          experience_years: true,
          rating: true,
          userId: true,
        },
        available: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      },
      where: {
        userId,
      },
      order: {
        available: {
          startTime: "ASC",
        },
      },
    };

    if (!userId) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.USER_ID_REQUIRED);
    }
    // ✅ Filter by specific date (date, month, year)
    if (date && month && year) {
      const targetDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(date)
      );
      criteria.where = {
        ...criteria.where,
        available: {
          date: targetDate,
        },
      };
    }
    // ✅ Filter by month & year
    else if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      criteria.where = {
        ...criteria.where,
        available: {
          date: Between(startDate, endDate),
        },
      };
    }
    // ✅ Filter by year only
    else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59);
      criteria.where = {
        ...criteria.where,
        available: {
          date: Between(startDate, endDate),
        },
      };
    }
    const appointments = await appointmentRepository.find(criteria);
    const users = await Promise.all(
      appointments.map((apt: Appointment) => {
        return UserService.checkUserExisted({
          userId: apt.expert.userId as string,
        });
      })
    );
    // ✅ Map appointments with user info
    const result = appointments.map((apt: Appointment, index: number) => ({
      id: apt.id,
      date: new Date(apt.available!.date).toISOString().split("T")[0], // YYYY-MM-DD
      startTime: apt.available!.startTime,
      endTime: apt.available!.endTime,
      status: apt.status,
      type: apt.type,
      userId: apt.userId,
      expert: {
        id: apt.expert.id,
        fullName: users[index].fullName,
        gender: users[index].gender,
        username: users[index].username,
        avatar: users[index].avatar,
        experience_years: apt.expert.experience_years,
        rating: apt.expert.rating,
      },
    }));

    return {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      total_items: appointments.length,
      total_pages: Math.ceil(
        appointments.length / (limit ? Number(limit) : 10)
      ),
      appointments: result,
    };
  };

  static add = async ({ req, res }: { req: Request; res: Response }) => {
    const { userId, expertId, availableId, issues, notes, type } = req.body;

    const { dataSource } = req.app.locals;
    const { user } = res.locals.session;
    const expertAvailabilityRepository =
      dataSource.getRepository(ExpertAvailability);

    // Check schedule is available
    const expertAvailability = await expertAvailabilityRepository.findOne({
      where: {
        id: availableId,
        expert: {
          id: expertId,
        },
      },
    });

    if (!expertAvailability || !expertAvailability.isAvailable) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.SCHEDULE_NOT_AVAILABLE);
    }

    return await dataSource.transaction(async (manager: EntityManager) => {
      try {
        const newAppointment = manager.getRepository(Appointment).create({
          createdBy: user.user_id,
          userId,
          expert: expertId,
          available: availableId,
          fees:
            type === AppointmentType.CALL
              ? DEFAULT_FEES.EXPERT_CALL_FEES
              : DEFAULT_FEES.EXPERT_MESSAGE_FEES,
          type,
          issues,
          notes,
          paymentStatus: PaymentStatus.PAID,
          status: AppointmentStatus.CONFIRMED,
        });

        await manager.getRepository(Appointment).save(newAppointment);

        // Mark the availability as unavailable
        expertAvailability.isAvailable = false;
        await manager
          .getRepository(ExpertAvailability)
          .save(expertAvailability);

        // Ensure UserService transaction is also within the same transaction
        await UserService.makeBookingTransaction({
          userId: user.user_id,
          amount:
            -1 *
            (type === AppointmentType.CALL
              ? DEFAULT_FEES.EXPERT_CALL_FEES
              : DEFAULT_FEES.EXPERT_MESSAGE_FEES),
        });

        return newAppointment;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw new InternalServerError("Failed to create appointment.");
      }
    });
  };
  static addUsingRabbitMQ = async ({
    userId,
    expertId,
    availableId,
    issues,
    notes,
    type,
  }: {
    userId: any;
    expertId: any;
    availableId: any;
    issues: any;
    notes: any;
    type: any;
  }) => {
    const expertAvailabilityRepository =
      AppDataSource.getRepository(ExpertAvailability);

    // Check schedule is available
    const expertAvailability = await expertAvailabilityRepository.findOne({
      where: {
        id: availableId,
        expert: {
          id: expertId,
        },
      },
    });

    if (!expertAvailability || !expertAvailability.isAvailable) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.SCHEDULE_NOT_AVAILABLE);
    }

    return await AppDataSource.transaction(async (manager: EntityManager) => {
      try {
        const newAppointment = manager.getRepository(Appointment).create({
          createdBy: userId,
          userId,
          expert: expertId,
          available: availableId,
          fees:
            type === AppointmentType.CALL
              ? DEFAULT_FEES.EXPERT_CALL_FEES
              : DEFAULT_FEES.EXPERT_MESSAGE_FEES,
          type,
          issues,
          notes,
          paymentStatus: PaymentStatus.PAID,
        });

        await manager.getRepository(Appointment).save(newAppointment);

        // Mark the availability as unavailable
        expertAvailability.isAvailable = false;
        await manager
          .getRepository(ExpertAvailability)
          .save(expertAvailability);

        // Ensure UserService transaction is also within the same transaction
        await UserService.makeBookingTransaction({
          userId,
          amount:
            -1 *
            (type === AppointmentType.CALL
              ? DEFAULT_FEES.EXPERT_CALL_FEES
              : DEFAULT_FEES.EXPERT_MESSAGE_FEES),
        });

        return newAppointment;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw new InternalServerError("Failed to create appointment.");
      }
    });
  };
  static updateAppointmentStatus = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const { dataSource } = req.app.locals;
    const { user } = res.locals.session;
    const appointmentRepository = dataSource.getRepository(Appointment);
    const appointment = await appointmentRepository.findOne({
      relations: {
        available: true,
      },
      where: {
        id,
      },
    });

    if (!appointment) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND);
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestError(
        APPOINTMENT_MESSAGES.APPOINTMENT_ALREADY_CANCELLED
      );
    }

    if (status === AppointmentStatus.CANCELLED && !cancellationReason) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.MISSING_CANCEL_REASON);
    }

    return await dataSource.transaction(async (manager: EntityManager) => {
      try {
        appointment.status = status;
        appointment.cancellationReason = cancellationReason;
        appointment.updatedBy = user.user_id;
        await manager.getRepository(Appointment).save(appointment);

        if (status === AppointmentStatus.CANCELLED) {
          const expertAvailability = await manager
            .getRepository(ExpertAvailability)
            .findOne({
              where: {
                id: appointment.available!.id,
              },
            });

          expertAvailability!.isAvailable = true;
          await manager
            .getRepository(ExpertAvailability)
            .save(expertAvailability!);

          // Ensure UserService transaction is also within the same transaction
          await UserService.makeRefundTransaction({
            userId: user.user_id,
            amount: appointment.fees,
          });
        }

        return appointment;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw new InternalServerError(
          APPOINTMENT_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT
        );
      }
    });
  };
  static cancelAppointment = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const { dataSource } = req.app.locals;
    const { user } = res.locals.session;
    const appointmentRepository = dataSource.getRepository(Appointment);
    const appointment = await appointmentRepository.findOne({
      relations: {
        available: true,
      },
      where: {
        id,
      },
    });

    if (!appointment) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND);
    }

    if (!cancellationReason) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.MISSING_CANCEL_REASON);
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestError(
        APPOINTMENT_MESSAGES.APPOINTMENT_ALREADY_CANCELLED
      );
    }

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_NOT_CANCELLED);
    }

    return await dataSource.transaction(async (manager: EntityManager) => {
      try {
        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancellationReason = cancellationReason;
        appointment.updatedBy = user.user_id;
        appointment.canceler = user.user_id;
        await manager.getRepository(Appointment).save(appointment);

        const expertAvailability = await manager
          .getRepository(ExpertAvailability)
          .findOne({
            where: {
              id: appointment.available!.id,
            },
          });

        expertAvailability!.isAvailable = true;
        await manager
          .getRepository(ExpertAvailability)
          .save(expertAvailability!);

        // Ensure UserService transaction is also within the same transaction
        await UserService.makeRefundTransaction({
          userId: user.user_id,
          amount: appointment.fees,
        });

        return appointment;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw new InternalServerError(
          APPOINTMENT_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT
        );
      }
    });
  };
  static ratingAppointment = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { id } = req.params;
    const { content, rating } = req.body;
    const { dataSource } = req.app.locals;
    const { user } = res.locals.session;
    const appointmentRepository = dataSource.getRepository(Appointment);
    const appointment = await appointmentRepository.findOne({
      where: {
        id,
      },
    });

    if (!appointment) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND);
    }

    await dataSource.transaction(async (manager: EntityManager) => {
      try {
        const newAppointmentReview = manager
          .getRepository(AppointmentReview)
          .create({
            rating,
            content,
            createdBy: user.user_id,
          });
        await manager
          .getRepository(AppointmentReview)
          .save(newAppointmentReview);
        appointment.appointmentReview = newAppointmentReview;
        await manager.getRepository(Appointment).save(appointment);
        return newAppointmentReview;
      } catch (error) {
        throw new InternalServerError(
          APPOINTMENT_MESSAGES.FAILED_TO_RATING_APPOINTMENT
        );
      }
    });
  };
  static ratingExpertAppointment = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { id } = req.params;
    const { content, rating } = req.body;
    const { dataSource } = req.app.locals;
    const { user } = res.locals.session;
    const appointmentRepository = dataSource.getRepository(Appointment);
    const appointment = await appointmentRepository.findOne({
      relations: {
        expert: true,
      },
      where: {
        id,
      },
    });

    if (!appointment) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND);
    }

    await dataSource.transaction(async (manager: EntityManager) => {
      try {
        const newExpertAppointmentReview = manager
          .getRepository(ExpertReview)
          .create({
            rating,
            content,
            createdBy: user.user_id,
            expert: appointment.expert,
            userId: appointment.userId,
          });
        await manager
          .getRepository(ExpertReview)
          .save(newExpertAppointmentReview);
        appointment.expertReview = newExpertAppointmentReview;
        await manager.getRepository(Appointment).save(appointment);
        return newExpertAppointmentReview;
      } catch (error) {
        throw new InternalServerError(
          APPOINTMENT_MESSAGES.FAILED_TO_RATING_EXPERT
        );
      }
    });
  };
  static getAppointmentStatisticByYear = async ({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }) => {
    const { year } = req.query;
    const { dataSource } = req.app.locals;
    const appointmentRepository = dataSource.getRepository(Appointment);

    if (isNaN(Number(year))) {
      throw new BadRequestError(APPOINTMENT_MESSAGES.YEAR_INVALID);
    }

    let yearParam = year ? Number(year) : new Date().getFullYear();
    const appointment = await appointmentRepository.find({
      relations: {
        available: true,
      },
      where: {
        status: AppointmentStatus.COMPLETED,
        available: {
          date: Between(
            new Date(yearParam, 0, 1),
            new Date(yearParam, 11, 31, 23, 59, 59)
          ),
        },
      },
      select: {
        id: true,
        available: {
          id: true,
          date: true,
        },
      },
    });

    console.log(
      "Appointment count by month:",
      JSON.stringify(appointment, null, 2)
    );

    // 12 months in a year
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
    }));
    // Count appointments for each month
    appointment.forEach((apt: Appointment) => {
      const month = new Date(apt.available!.date).getMonth(); // 0-indexed
      months[month].count += 1;
    });

    return months;
  };
  static softDelete = async (req: Request, res: Response) => {};
  static hardDelete = async (req: Request, res: Response) => {};
}
