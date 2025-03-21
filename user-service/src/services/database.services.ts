import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { envConfig } from '~/constants/config'
import HealthTracking from '~/models/schemas/HealthTrackings.schema'
import HealthTrackingDetail from '~/models/schemas/HealthTrackingDetails.schema'
import { Water } from '~/models/schemas/Water.schema'
import Meals from '~/models/schemas/Meals.schema'
import Challenges from '~/models/schemas/Challenges.schema'
import Exercises from '~/models/schemas/Exercises.schema'
import SetExercises from '~/models/schemas/SetExercises.schema'
import Sets from '~/models/schemas/Sets.schema'
import WorkoutPlanDetails from '~/models/schemas/WorkoutPlanDetails.schema'
import WorkoutPlans from '~/models/schemas/WorkoutPlans.schema'
import Dishes from '~/models/schemas/Dishes.schema'
import Ingredients from '~/models/schemas/Ingredients.schema'
import Reports from '~/models/schemas/Report.schema'
import ChatRoom from '~/models/schemas/ChatRoom.schema'
import ChatDetail from '~/models/schemas/ChatDetail.schema'
import Transaction from '~/models/schemas/Transactions.schema'
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dlxrr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Database Error:', error)
    }
  }
  async createIndexes() {
    await Promise.all([this.indexWords()])
  }
  async indexWords() {
    // const exists = await this.words.indexExists(['name_text'])
    // if (!exists) {
    //   this.words.createIndex(
    //     {
    //       name: 'text'
    //     },
    //     { default_language: 'none' }
    //   )
    // }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection as string)
  }
  get healthTrackings(): Collection<HealthTracking> {
    return this.db.collection(envConfig.dbHealthTrackingsCollection as string)
  }
  get healthTrackingDetails(): Collection<HealthTrackingDetail> {
    return this.db.collection(envConfig.dbHealthTrackingDetailsCollection as string)
  }
  get waters(): Collection<Water> {
    return this.db.collection(envConfig.dbWatersCollection as string)
  }
  get meals(): Collection<Meals> {
    return this.db.collection(envConfig.dbMealsCollection as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection as string)
  }
  get challenges(): Collection<Challenges> {
    return this.db.collection(envConfig.dbChallengesCollection as string)
  }
  get exercises(): Collection<Exercises> {
    return this.db.collection(envConfig.dbExercisesCollection as string)
  }
  get set_exercises(): Collection<SetExercises> {
    return this.db.collection(envConfig.dbSetExercisesCollection as string)
  }
  get sets(): Collection<Sets> {
    return this.db.collection(envConfig.dbSetsCollection as string)
  }
  get workoutPlanDetails(): Collection<WorkoutPlanDetails> {
    return this.db.collection(envConfig.dbWorkoutPlanDetailsCollection as string)
  }
  get workoutPlans(): Collection<WorkoutPlans> {
    return this.db.collection(envConfig.dbWorkoutPlansCollection as string)
  }
  get dishes(): Collection<Dishes> {
    return this.db.collection(envConfig.dbDishesCollection as string)
  }
  get ingredients(): Collection<Ingredients> {
    return this.db.collection(envConfig.dbIngredientsCollection as string)
  }
  get reports(): Collection<Reports> {
    return this.db.collection(envConfig.dbReportsCollection as string)
  }
  get chatRooms(): Collection<ChatRoom> {
    return this.db.collection(envConfig.dbChatRoomsCollection as string)
  }
  get chatDetails(): Collection<ChatDetail> {
    return this.db.collection(envConfig.dbChatDetailsCollection as string)
  }
  get transactions(): Collection<Transaction> {
    return this.db.collection(envConfig.dbTransactionsCollection as string)
  }
}
const databaseService = new DatabaseService()
export default databaseService
