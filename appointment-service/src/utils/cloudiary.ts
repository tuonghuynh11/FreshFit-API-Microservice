import { v2 as cloudinary } from "cloudinary";
import config from "../configuration";

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});
export const uploadVideoToCloudinary = async (video_url: string) => {
  try {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        video_url,
        {
          resource_type: "video",
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
    return result.url;
  } catch (error) {
    return "";
  }
};
export const uploadImageToCloudinary = async (image_url: string) => {
  try {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        image_url,
        {
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
    return result.url;
  } catch (error) {
    return "";
  }
};
