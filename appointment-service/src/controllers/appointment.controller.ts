import { NextFunction, Request, Response } from "express";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Delete, Get, Patch, Post } from "../decorators/handlers";
import { SystemRole } from "../utils/enums";
import ProductCategoryRepository from "../database/repositories/category.repository";
import AppointmentRepository from "../database/repositories/appointment.repository";
import { UseMiddlewares } from "../decorators/middleware";
import { validateDto } from "../middlewares/dto.middlewares";
import { AppointmentDto } from "../dtos/appointment.dto";
import { validatePagination } from "../middlewares/pagination.middlewares";
import { APPOINTMENT_MESSAGES } from "../common/messages/index.messages";
import {
  Appointment,
  AppointmentType,
} from "../database/entities/Appointments";
import Authenticate from "../decorators/authenticate";
import { publishToQueue } from "../utils/rabbitmq";
import { QUEUE_NAMES } from "../common/constants/rabbitMq.values";

@Controller("/appointments")
@Authenticate()
export default class AppointmentController {
  @Get("/")
  public async index(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await ProductCategoryRepository.getAllCategories(req);
      res.locals.data = response;

      next();
    } catch (error) {
      next(error);
    }
  }

  @Post("/book")
  @Authorize([SystemRole.User, SystemRole.Admin])
  @UseMiddlewares(validateDto(AppointmentDto))
  public async add(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await AppointmentRepository.add({ req, res });
      res.locals.message = APPOINTMENT_MESSAGES.APPOINTMENT_CREATED;
      res.locals.data = response;
      const { userId, expertId, availableId, issues, notes, type } = req.body;
      const bookingReq = { userId, expertId, availableId, issues, notes, type };
      await publishToQueue(QUEUE_NAMES.BOOKING_QUEUE, bookingReq);
      next();
    } catch (error) {
      next(error);
    }
  }

  @Get("/user/:userId")
  @Authorize([SystemRole.Admin])
  @UseMiddlewares(validatePagination)
  public async getAptByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { appointments, limit, page, total_items, total_pages } =
        await AppointmentRepository.getAptByUserId(req);
      res.locals.message = APPOINTMENT_MESSAGES.GET_APPOINTMENT_SUCCESS;
      res.locals.data = {
        appointments,
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
  @Get("/user")
  @Authorize("*")
  @UseMiddlewares(validatePagination)
  public async getAptByAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { appointments, limit, page, total_items, total_pages } =
        await AppointmentRepository.getAptByAccessToken({
          req,
          res,
        });
      res.locals.message = APPOINTMENT_MESSAGES.GET_APPOINTMENT_SUCCESS;
      res.locals.data = {
        appointments,
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

  @Get("/expert/:expertId")
  @Authorize([SystemRole.Admin, SystemRole.Expert])
  @UseMiddlewares(validatePagination)
  public async getAptByExpertId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { appointments, limit, page, total_items, total_pages } =
        await AppointmentRepository.getAptByExpertId(req);
      res.locals.message = APPOINTMENT_MESSAGES.GET_APPOINTMENT_SUCCESS;
      res.locals.data = {
        appointments,
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
  @Get("/:id")
  @Authorize("*")
  public async getAptDetailById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointment = await AppointmentRepository.getAptDetailById(req);
      res.locals.message = APPOINTMENT_MESSAGES.GET_APPOINTMENT_SUCCESS;
      res.locals.data = {
        appointment,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Patch("/:id")
  @Authorize([SystemRole.Admin, SystemRole.Expert, SystemRole.User])
  public async updateAppointmentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointment: any =
        await AppointmentRepository.updateAppointmentStatus({
          req,
          res,
        });
      res.locals.data = {
        appointment,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  @Post("/:id/cancel")
  @Authorize([SystemRole.User, SystemRole.Expert])
  public async cancelAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointment: any = await AppointmentRepository.cancelAppointment({
        req,
        res,
      });
      res.locals.message = APPOINTMENT_MESSAGES.CANCEL_APPOINTMENT_SUCCESS;
      res.locals.data = {
        appointment,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Post("/:id/rating")
  @Authorize([SystemRole.User])
  public async ratingAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rating: any = await AppointmentRepository.ratingAppointment({
        req,
        res,
      });
      res.locals.message = APPOINTMENT_MESSAGES.RATING_APPOINTMENT_SUCCESS;
      res.locals.data = {
        rating,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
  @Post("/:id/expert/rating")
  @Authorize([SystemRole.User])
  public async ratingExpertAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rating: any = await AppointmentRepository.ratingExpertAppointment({
        req,
        res,
      });
      res.locals.message = APPOINTMENT_MESSAGES.RATING_EXPERT_SUCCESS;
      res.locals.data = {
        rating,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }

  /////Delete this can affect the products and many other things, consider some checks before deleting !important
  @Delete("/:id")
  @Authorize([SystemRole.Admin])
  public async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProductCategoryRepository.softDelete(req, res);
      res.locals.message = "Product category successfully deleted";
      next();
    } catch (error) {
      next(error);
    }
  }
  @Delete("/:id/permanently")
  @Authorize([SystemRole.Admin])
  public async hardDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProductCategoryRepository.hardDelete(req, res);
      res.locals.message = "Product category successfully deleted permanently";
      next();
    } catch (error) {
      next(error);
    }
  }

  @Get("/test/demo")
  @Authorize("*")
  public async getTestAptDetailById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("ProductCategoryRepository");
      const { dataSource } = req.app.locals;
      const appointmentRepository = dataSource.getRepository(Appointment);
      const appointment = await appointmentRepository.findOne({
        where: {
          type: AppointmentType.CALL,
        },
      });
      res.locals.message = APPOINTMENT_MESSAGES.GET_APPOINTMENT_SUCCESS;
      res.locals.data = {
        appointment,
      };

      next();
    } catch (error) {
      next(error);
    }
    next();
  }
}
