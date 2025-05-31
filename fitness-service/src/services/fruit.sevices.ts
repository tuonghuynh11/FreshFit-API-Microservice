import * as path from 'path'
import * as fs from 'fs'
import { ASSETS_DIR } from '~/constants/dir'
import { ErrorWithStatus } from '~/models/Errors'
import { FRUIT_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
class FruitService {
  async getByName(name: string) {
    const result = await new Promise((resolve, reject) => {
      const filePath = path.resolve(ASSETS_DIR, 'fruits.json') // Adjust path as needed
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          return reject(err)
        }
        try {
          const fruits: any = JSON.parse(data)
          const fruit = fruits[name] || null
          resolve(fruit)
        } catch (parseError) {
          reject(parseError)
        }
      })
    })
    if (!result) {
      throw new ErrorWithStatus({
        message: FRUIT_MESSAGES.FRUIT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
}
const fruitService = new FruitService()
export default fruitService
