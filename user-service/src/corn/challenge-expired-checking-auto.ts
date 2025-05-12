import { ChallengeStatus, UserChallengeParticipationStatus } from '~/constants/enums'
import databaseService from '~/services/database.services'

export const challengeExpiredCheckingAuto = async () => {
  const now = new Date()
  const challenges = await databaseService.challenges
    .find({
      status: ChallengeStatus.Active,
      end_date: {
        $lt: now
      }
    })
    .toArray()

  const userChallengeParticipations = await databaseService.userChallengeParticipation
    .find({
      status: {
        $in: [UserChallengeParticipationStatus.Pending, UserChallengeParticipationStatus.Ongoing]
      },
      challenge_id: {
        $in: challenges.map((challenge) => challenge._id)
      }
    })
    .toArray()
  await Promise.all([
    challenges.map(async (challenge) => {
      await databaseService.challenges.updateOne(
        {
          _id: challenge._id
        },
        {
          $set: {
            status: ChallengeStatus.Expired
          }
        }
      )
    }),
    userChallengeParticipations.map(async (userChallengeParticipation) => {
      await databaseService.userChallengeParticipation.updateOne(
        {
          _id: userChallengeParticipation._id
        },
        {
          $set: {
            status: UserChallengeParticipationStatus.Expired
          }
        }
      )
    })
  ])
  console.log(
    '🚀 ~ challengeExpiredCheckingAuto ~ challenges:',
    challenges.map((challenge) => challenge._id)
  )
  console.log(
    '🚀 ~ challengeExpiredCheckingAuto ~ userChallengeParticipations:',
    userChallengeParticipations.map((item) => item._id)
  )
}
