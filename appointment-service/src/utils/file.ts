import fs from "fs";
import { Request } from "express";
import formidable, { File } from "formidable";
import config from "../configuration";
import { BadRequestError } from "./errors";
import { exec } from "child_process";
import { promisify } from "util";
export const initFolder = () => {
  [config.upload_image_temp_dir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true, //Create nested folder
      });
    }
  });
  [config.upload_excel_temp_dir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true, //Create nested folder
      });
    }
  });
  [config.upload_csv_temp_dir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true, //Create nested folder
      });
    }
  });
};
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: config.upload_image_temp_dir, //Image Temporary Folder
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, //5MB,
    maxTotalFileSize: 5 * 1024 * 1024 * 4,

    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === "image" && Boolean(mimetype?.includes("image"));
      if (!valid) {
        form.emit("error" as any, new Error("File type is not valid") as any);
      }
      return valid;
    },
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!Boolean(files.image)) {
        return reject(new Error("File is empty"));
      }
      resolve(files.image as File[]);
    });
  });
};
export const handleUploadExcel = async (req: Request) => {
  const form = formidable({
    uploadDir: config.upload_excel_temp_dir, //Excel Temporary Folder
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    maxTotalFileSize: 10 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid =
        name === "excel-file" &&
        mimetype ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      if (!valid) {
        form.emit(
          "error" as any,
          new Error("Please upload a valid Excel (.xlsx) file") as any
        );
      }
      return valid;
    },
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!Boolean(files["excel-file"])) {
        return reject(new Error("File is empty"));
      }
      resolve(files["excel-file"] as File[]);
    });
  });
};
export const handleUploadCSV = async (req: Request) => {
  const form = formidable({
    uploadDir: config.upload_csv_temp_dir, //CSV Temporary Folder
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    maxTotalFileSize: 10 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === "csv-file" && mimetype === "text/csv";
      if (!valid) {
        form.emit(
          "error" as any,
          new BadRequestError("Please upload a valid CSV file") as any
        );
      }
      return valid;
    },
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!Boolean(files["csv-file"])) {
        return reject(new Error("File is empty"));
      }
      resolve(files["csv-file"] as File[]);
    });
  });
};
export const getNameFromFilename = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  // If no dot exists, return the whole file name
  if (lastDotIndex === -1) {
    return fileName;
  }
  return fileName.substring(0, lastDotIndex);
};
export const getExtension = (fileName: string) => {
  const name = fileName.split(".");
  return name[name.length - 1];
};

// Function to compress, scale image, and delete the original image
export const compressImageWithFFmpeg = async (
  inputImagePath: string,
  outputImagePath: string
) => {
  try {
    const execPromise = promisify(exec);

    // FFmpeg command to scale the image to HD resolution and adjust quality
    const ffmpegCommand = `ffmpeg -i "${inputImagePath}" -vf "scale=1920:-1" -q:v 3 -fs 2M "${outputImagePath}"`;

    // Execute the FFmpeg command
    await execPromise(ffmpegCommand);

    // Check if the new image was successfully created
    try {
      fs.accessSync(outputImagePath);

      // Delete the original image
      fs.unlinkSync(inputImagePath);

      // Check size of the new image
      const fileStat = fs.statSync(outputImagePath);
      const fileSizeInMB = fileStat.size / (1024 * 1024);
      console.log(`Output file size: ${fileSizeInMB.toFixed(2)} MB`);
    } catch (accessError) {
      throw new Error("Output image not created or inaccessible.");
    }
  } catch (error: any) {
    throw new Error(`Error executing FFmpeg: ${error.message}`);
  }
};
export const deleteFolder = (dir: string) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
};
