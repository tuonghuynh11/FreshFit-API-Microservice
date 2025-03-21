import cron from 'node-cron'
import { healthTrackingAuto } from './healthTrackingAuto'
import { waterActivityAuto } from './waterActivityAuto'

export const initCronModule = () => {
  // Every day at 00:00:01 : 1 0 * * *

  // Every 10s: */10 * * * * *
  if (!cron.getTasks().has('1 0 * * *')) {
    cron.schedule('1 0 * * *', async () => {
      try {
        waterActivityAuto()
        healthTrackingAuto()
      } catch (error) {
        console.log('Cron Error: ' + error)
      }
    })
  }
}
