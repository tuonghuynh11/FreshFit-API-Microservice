import { v2 as cloudinary } from 'cloudinary'
import { envConfig } from '~/constants/config'
cloudinary.config({
  cloud_name: envConfig.cloud_name,
  api_key: envConfig.api_key,
  api_secret: envConfig.api_secret,
  timeout: 70000 // 60 seconds
})
export const uploadVideoToCloudinary = async (video_url: string) => {
  // try {
  //   const result: any = await new Promise((resolve, reject) => {
  //     cloudinary.uploader.upload_large(
  //       video_url,
  //       {
  //         resource_type: 'video'
  //       },
  //       (error, result) => {
  //         if (error) {
  //           reject(error)
  //         }
  //         resolve(result)
  //       }
  //     )
  //   })
  //   return result.url
  // } catch (error) {
  //   return ''
  // }
  // const result: any = await new Promise((resolve, reject) => {
  //   cloudinary.uploader.upload_large(
  //     video_url,
  //     {
  //       resource_type: 'video',
  //       chunk_size: 6 * 1024 * 1024 // chia thành từng phần 6MB
  //     },
  //     (error, result) => {
  //       if (error) {
  //         reject(error)
  //       }
  //       resolve(result)
  //     }
  //   )
  // })
  const result = await cloudinary.uploader.upload(video_url, {
    resource_type: 'video',
    use_filename: true,
    unique_filename: true,
    folder: 'FreshFit/Videos'
  })

  return result.secure_url
}
export const uploadImageToCloudinary = async (image_url: string) => {
  // try {
  //   const result: any = await new Promise((resolve, reject) => {
  //     cloudinary.uploader.upload_large(
  //       image_url,
  //       {
  //         resource_type: 'image'
  //       },
  //       (error, result) => {
  //         if (error) {
  //           reject(error)
  //         }
  //         resolve(result)
  //       }
  //     )
  //   })
  //   return result.url
  // } catch (error) {
  //   return ''
  // }
  // const result: any = await new Promise((resolve, reject) => {
  //   cloudinary.uploader.upload_large(
  //     image_url,
  //     {
  //       resource_type: 'image'
  //     },
  //     (error, result) => {
  //       if (error) {
  //         reject(error)
  //       }
  //       resolve(result)
  //     }
  //   )
  // })
  const result: any = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image_url,
      {
        resource_type: 'image',
        use_filename: true,
        unique_filename: true, // 👉 đảm bảo không trùng tên
        folder: 'FreshFit/Images'
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        resolve(result)
      }
    )
  })
  return result.secure_url
}
