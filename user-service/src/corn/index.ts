import cron from 'node-cron'
import { healthTrackingAuto } from './healthTrackingAuto'
import { waterActivityAuto } from './waterActivityAuto'
import { caloriesCheckingAuto } from './caloriesCheckingAuto'
import { challengeExpiredCheckingAuto } from './challenge-expired-checking-auto'

const scheduledTasks = new Map<string, cron.ScheduledTask>()

const CRON_SCHEDULE = {
  EVERYDAY_AT_00_01: '1 0 * * *',
  EVERYDAY_AT_00_01_V2: '1 0 * * *',
  EVERYDAY_AT_21_00: '0 21 * * *',
  EVERY_10_SECONDS: '*/10 * * * * *'
}

export const initCronModule = () => {
  // Every day at 00:00:01 : 1 0 * * *

  // Every 10s: */10 * * * * *
  if (!cron.getTasks().has(CRON_SCHEDULE.EVERYDAY_AT_00_01)) {
    const task = cron.schedule(CRON_SCHEDULE.EVERYDAY_AT_00_01, async () => {
      try {
        console.log('==========Cron job water activity and healthTracking started')
        await Promise.all([waterActivityAuto(), healthTrackingAuto()])
      } catch (error) {
        console.log('Cron Error: ' + error)
      }
    })
    scheduledTasks.set(CRON_SCHEDULE.EVERYDAY_AT_00_01, task)
  }

  // Every day at 21:00:00
  if (!cron.getTasks().has(CRON_SCHEDULE.EVERYDAY_AT_21_00)) {
    const task = cron.schedule(CRON_SCHEDULE.EVERYDAY_AT_21_00, async () => {
      try {
        console.log('==========Cron job calories checking started')

        await caloriesCheckingAuto()
      } catch (error) {
        console.log('Cron Error: ' + error)
      }
    })
    scheduledTasks.set(CRON_SCHEDULE.EVERYDAY_AT_21_00, task)
  }

  // Every Day at 00:00:01
  if (!cron.getTasks().has(CRON_SCHEDULE.EVERYDAY_AT_00_01_V2)) {
    const task = cron.schedule(CRON_SCHEDULE.EVERYDAY_AT_00_01_V2, async () => {
      try {
        console.log('==========Cron job challenge expired checking started')

        await challengeExpiredCheckingAuto()
      } catch (error) {
        console.log('Cron Error: ' + error)
      }
    })
    scheduledTasks.set(CRON_SCHEDULE.EVERYDAY_AT_00_01_V2, task)
  }
}
