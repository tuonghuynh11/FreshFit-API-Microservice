import { NextFunction, Request, Response } from "express";
import Authenticate from "../decorators/authenticate";
import Authorize from "../decorators/authorize";
import Controller from "../decorators/controller";
import { Post } from "../decorators/handlers";

import { handleUploadImage } from "../utils/file";
import { MediaType } from "../utils/enums";
import { uploadImageToCloudinary } from "../utils/cloudiary";

@Controller("/medias")
@Authenticate()
export default class MediaController {
  @Post("/upload-image")
  @Authorize()
  public async uploadImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files: any = await handleUploadImage(req);
      const filePath = files[0].filepath;
      const fileName = files[0].newFilename;
      const result = filePath.substring(0, filePath.lastIndexOf("\\"));
      const image_url = await uploadImageToCloudinary(files[0].filepath);

      // const newPath = path.resolve(config.upload_image_dir, `${fileName}`);

      // await compressImageWithFFmpeg(filePath, newPath);

      res.locals.data = {
        // url: `${config.serverSite}/static/image/${fileName}`,
        url: image_url,
        type: MediaType.Image,
      };

      next();
    } catch (error) {
      next(error);
    }
  }
}
