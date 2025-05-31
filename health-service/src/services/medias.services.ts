import { Request } from 'express'
import { MediaType } from '~/constants/enums'
import { deleteFolder, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { uploadImageToCloudinary, uploadVideoToCloudinary } from '~/utils/cloudinary'

class MediaService {
  async uploadVideo(req: Request) {
    const files: any = await handleUploadVideo(req)
    const { newFilename } = files[0]

    // const result = await files.map(async (file: File) => {
    //   return new Promise(async (resolve, reject) => {
    //     const video_url = await uploadVideoToCloudinary(file.filepath)
    //     console.log('file path: ' + video_url)
    //     resolve({
    //       url: video_url,
    //       type: MediaType.Video
    //     })
    //   })
    // })
    const filePath = files[0].filepath
    const result = filePath.substring(0, filePath.lastIndexOf('\\'))
    const video_url = await uploadVideoToCloudinary(files[0].filepath)
    deleteFolder(result)
    return {
      url: video_url,
      type: MediaType.Video
    }
  }
  async uploadImage(req: Request) {
    const files: any = await handleUploadImage(req)
    const { newFilename } = files[0]

    // const result = await files.map(async (file: File) => {
    //   return new Promise(async (resolve, reject) => {
    //     const video_url = await uploadVideoToCloudinary(file.filepath)
    //     console.log('file path: ' + video_url)
    //     resolve({
    //       url: video_url,
    //       type: MediaType.Video
    //     })
    //   })
    // })
    const filePath = files[0].filepath
    const result = filePath.substring(0, filePath.lastIndexOf('\\'))
    const image_url = await uploadImageToCloudinary(files[0].filepath)
    deleteFolder(result)
    return {
      url: image_url,
      type: MediaType.Image
    }
  }
}
const mediaService = new MediaService()
export default mediaService
