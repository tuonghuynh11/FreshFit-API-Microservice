import { config } from "dotenv";
import "dotenv/config";
import path from "path";
const env = process.env.NODE_ENV?.trim();
if (!env) {
  console.log(
    `You don't provide environment variables NODE_ENV (ví dụ: development, production)`
  );
  console.log(`Detect NODE_ENV = ${env}`);
}
console.log(
  `Detect NODE_ENV = ${env}, so that the application will use NODE_ENV: ${env}`
);
export const isProduction = env === "production";
config({
  path: env ? `.env.${env}` : ".env",
});
interface ConfigValues {
  env: string;
  port: number;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbDatabase: string;
  dbSynchronize: boolean;
  dbLogging: boolean;
  dbEntitiesDir: string;
  dbSubscribersDir: string;
  dbMigrationsDir: string;
  jwtAccessKey: string;
  jwtRefreshKey: string;
  clientSite: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  rabbitMQHost: string;
}

class Config implements ConfigValues {
  env = process.env.NODE_ENV || "development";
  port = parseInt(process.env.PORT || "4000", 10);
  userServiceHost =
    process.env.USER_SERVICE_HOST || "http://localhost:4001/api/v1";
  recommendationServiceHost =
    process.env.RECOMMENDATION_SERVICE_HOST || "http://localhost:4003";
  dbHost = process.env.DB_HOST || "localhost";
  dbPort = parseInt(process.env.DB_PORT || "5432", 10);
  dbUsername = process.env.DB_USERNAME || "postgres";
  dbPassword = process.env.DB_PASSWORD || "postgres";
  dbDatabase = process.env.DB_DATABASE || "erp-redesign";
  dbSynchronize = process.env.DB_SYNCHRONIZE
    ? process.env.DB_SYNCHRONIZE === "true"
    : true;
  dbLogging = process.env.DB_LOGGING ? process.env.DB_LOGGING === "true" : true;
  dbEntitiesDir = process.env.DB_ENTITIES_DIR || "src/database/entities/*.ts";
  dbSubscribersDir =
    process.env.DB_SUBSCRIBERS_DIR || "src/database/subscribers/*.ts";
  dbMigrationsDir =
    process.env.DB_MIGRATIONS_DIR || "src/database/migrations/*.ts";
  jwtAccessKey = process.env.JWT_ACCESS_KEY || "THIS IS ACCESS KEY";
  jwtRefreshKey = process.env.JWT_REFRESH_KEY || "THIS IS REFRESH KEY";
  clientSite = process.env.CLIENT_SITE || "http://localhost:5173";
  adminSite = process.env.ADMIN_SITE || "http://localhost:5173";
  shopkeeperSite = process.env.SHOPKEEPER_SITE || "http://localhost:5173";
  smtpHost = process.env.SMTP_HOST || "mail9066@yopmail.com";
  smtpPort = parseInt(process.env.SMTP_PORT || "25", 10);
  smtpSecure = process.env.SMTP_SECURE === "true";
  smtpUser = process.env.SMTP_USER || "";
  smtpPassword = process.env.SMTP_PASSWORD || "";
  upload_image_temp_dir = path.resolve(
    process.env.UPLOAD_IMAGE_TEMP_DIR || "uploads/images/temp"
  );
  upload_image_dir = path.resolve(
    process.env.UPLOAD_IMAGE_DIR || "uploads/images"
  );
  upload_excel_temp_dir = path.resolve(
    process.env.UPLOAD_EXCEL_TEMP_DIR || "uploads/excels/temp"
  );
  upload_excel_dir = path.resolve(
    process.env.UPLOAD_EXCEL_DIR || "uploads/excels"
  );
  upload_csv_temp_dir = path.resolve(
    process.env.UPLOAD_CSV_TEMP_DIR || "uploads/csvs/temp"
  );
  upload_csv_dir = path.resolve(process.env.UPLOAD_CSV_DIR || "uploads/csvs");
  serverSite = process.env.SERVER_SITE || "http://localhost:4000";

  google_client_id = process.env.GOOGLE_CLIENT_ID || "";
  google_client_secret = process.env.GOOGLE_CLIENT_SECRET || "";
  google_redirect_uri = process.env.GOOGLE_REDIRECT_URI || "";
  google_client_redirect_callback = process.env.CLIENT_REDIRECT_CALLBACK || "";

  // MOMO
  momo_access_key = process.env.MOMO_ACCESS_KEY || "";
  momo_secret_key = process.env.MOMO_SECRET_KEY || "";
  momo_partner_code = process.env.MOMO_PARTNER_CODE || "";
  momo_redirect_url = process.env.MOMO_REDIRECT_URL || "";
  momo_request_type = process.env.MOMO_REQUEST_TYPE || "";
  momo_payment_code = process.env.MOMO_PAYMENT_CODE || "";
  momo_language = process.env.MOMO_LANGUAGE || "";
  momo_auto_capture = process.env.MOMO_AUTO_CAPTURE === "true" ? true : false;
  momo_order_expire_time = Number(process.env.MOMO_ORDER_EXPIRE_TIME) || 5;
  //ZALO PAY
  zalo_app_id = process.env.ZALO_APP_ID || "";
  zalo_key_1 = process.env.ZALO_KEY_1 || "";
  zalo_key_2 = process.env.ZALO_KEY_2 || "";
  zalo_endpoint = process.env.ZALO_END_POINT || "";
  zalo_redirect_url = process.env.ZALO_REDIRECT_URL || "";
  zalo_app_user = process.env.ZALO_APP_USER || "";

  //Cloudinary
  cloud_name = process.env.CLOUD_NAME as string;
  api_key = process.env.API_KEY as string;
  api_secret = process.env.API_SECRET as string;

  admin_mail = process.env.ADMIN_MAIL as string;

  // RabbitMQ
  rabbitMQHost = process.env.RABBITMQ_HOST || "amqp://localhost";
}

export default new Config();
