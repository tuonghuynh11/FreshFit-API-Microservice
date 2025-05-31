import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import { recommendCalorieAndTimeToAchieveGoal } from '~/utils/recommend'
import { ActivityLevel, Gender, GoalDetailStatus, WorkoutType } from '~/constants/enums'
import { GoalDetail } from '~/models/schemas/GoalDetail.schema'
import { DishRecommendReqBody, DishRecommendReqQuery } from '~/models/requests/Recommend.requests'
import axios from 'axios'
import FormData from 'form-data'
import { getSetExercises } from '~/utils/commons'

class RecommendService {
  async createCalorieAndTimeToGoalRecommendForUser({ user_id }: { user_id: string }) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isPossibleToRecommend =
      user?.weight && user.goal_weight && user.height && user.date_of_birth && user.activityLevel
    if (!isPossibleToRecommend) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_ENOUGH_INFO,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    if (isPossibleToRecommend) {
      const age = new Date().getFullYear() - user.date_of_birth!.getFullYear()
      const recommend = recommendCalorieAndTimeToAchieveGoal({
        currentWeight: Number(user.weight),
        desiredWeight: Number(user.goal_weight),
        height: Number(user.height),
        age,
        gender: user.gender as Gender,
        activityLevel: user.activityLevel as ActivityLevel
      })
      const goalDetail = new GoalDetail({
        days: recommend.daysToGoal,
        goal: recommend.totalCalories, // Tổng thâm hụt caloies
        progress: 0,
        status: GoalDetailStatus.UnStart
      })
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            goalDetail: goalDetail
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      return goalDetail
    }
  }

  async getDishRecommend({ body, query }: { body: DishRecommendReqBody; query: DishRecommendReqQuery }) {
    // const dishRecommend = await axios.post(
    //   'https://dishes-recommendation-api.onrender.com/recommend',
    //   { ...body },
    //   {
    //     params: {
    //       query: {
    //         ...query
    //       }
    //     }
    //   }
    // )
    // return dishRecommend.data
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      recommendations: [
        [
          {
            _id: '677a995aeb2c723a87474f18',
            name: 'Boudin Blanc Terrine with Red Onion Confit ',
            description:
              'Boudin Blanc Terrine with Red Onion Confit is a French-inspired dish featuring a creamy white sausage terrine made from finely ground meats, cream, and spices. It�s paired with a sweet and tangy red onion confit, slow-cooked with sugar, vinegar, and wine. The dish is a harmonious blend of rich, savory, and subtly sweet flavors.',
            calories: 403,
            prep_time: 20,
            rating: 4.375,
            image: 'https://assets.epicurious.com/photos/5c93f15d7903444d883ded50/1:1/pass/undefined',
            instruction:
              '1.Preheat your oven to 350�F (175�C). | 2. Prepare the boudin blanc mixture by combining ground meat (such as pork or chicken), cream, eggs, and seasonings. | 3. Pour the mixture into a terrine dish and smooth the top. | 4. Cover and bake in a water bath for 45-60 minutes until cooked through. | 5. For the red onion confit, thinly slice the onions and cook in a pan with olive oil, sugar, and vinegar until caramelized. | 6. Serve the terrine chilled with the red onion confit on top.'
          },
          {
            _id: '677a995aeb2c723a87474f19',
            name: 'Korean Marinated Beef ',
            description:
              'Korean Marinated Beef, commonly known as Bulgogi, is a classic Korean dish featuring thinly sliced beef marinated in a savory-sweet mixture. The marinade typically includes soy sauce, sugar, sesame oil, garlic, ginger, and sometimes pear or apple for tenderizing and enhancing flavor. Grilled or pan-cooked, it�s served with rice, lettuce wraps, and banchan (side dishes), offering a delightful balance of smoky, sweet, and umami flavors.',
            calories: 170,
            prep_time: 15,
            rating: 4.375,
            image: 'https://s23209.pcdn.co/wp-content/uploads/2019/04/240124_DD_korean-beef-bulgogi_274.jpg',
            instruction:
              '1.Thinly slice the beef against the grain. | 2. In a bowl, combine soy sauce, sugar, sesame oil, garlic, ginger, and pear or apple puree for the marinade. | 3. Add the beef to the marinade and let it marinate for at least 30 minutes. | 4. Heat a pan or grill and cook the beef for 2-3 minutes per side until tender. | 5. Serve the bulgogi with rice and side dishes like kimchi.'
          },
          {
            _id: '677a995aeb2c723a87474f1a',
            name: 'Ham Persillade with Mustard Potato Salad and Mashed Peas ',
            description: 'A signature meat in US',
            calories: 602,
            prep_time: 60,
            rating: 3.75,
            image: 'https://assets.epicurious.com/photos/55f72d733c346243461d496e/1:1/pass/undefined',
            instruction:
              '1.For the ham persillade, mix parsley, garlic, breadcrumbs, and seasoning in a bowl. | 2. Coat the ham slices with the parsley mixture and roast in the oven until golden and crispy. | 3. For the mustard potato salad, boil potatoes until tender, then toss with mustard, olive oil, and herbs. | 4. For the mashed peas, cook peas and mash them with butter and cream. | 5. Serve the ham with the mustard potato salad and mashed peas on the side'
          }
        ],
        [
          {
            _id: '677a995aeb2c723a87474f1b',
            name: 'Yams Braised with Cream, Rosemary and Nutmeg ',
            description:
              "Ham Persillade with Mustard Potato Salad and Mashed Peas is a flavorful dish combining herb-crusted ham with parsley and garlic for a savory crunch. It's paired with tangy mustard-dressed potato salad and creamy mashed peas for a sweet, fresh contrast. Together, the dish offers a perfect balance of richness, tanginess, and earthiness.",
            calories: 256,
            prep_time: 30,
            rating: 3.75,
            image: 'https://assets.epicurious.com/photos/6672197195f68b43cddf7b14/1:1/pass/undefined',
            instruction:
              '1. Preheat your oven to 350�F (175�C). | 2. Peel and slice the yams into 1/2-inch thick rounds. | 3. In a large skillet, heat butter over medium heat, then add fresh rosemary sprigs and saut� for 1-2 minutes to release the aroma. | 4. Add the sliced yams to the skillet and saut� for a few minutes, coating them in the butter and rosemary. | 5. Pour in heavy cream, and season with salt, pepper, and a pinch of nutmeg. | 6. Bring to a simmer, then cover the skillet and transfer it to the oven. | 7. Braise the yams for 40-50 minutes, or until they are tender and the cream has thickened. | 8. Serve the braised yams warm as a side dish, garnished with extra rosemary if desired.'
          },
          {
            _id: '677a995aeb2c723a87474f1c',
            name: 'Banana-Chocolate Chip Cake With Peanut Butter Frosting ',
            description:
              'Banana-Chocolate Chip Cake With Peanut Butter Frosting is a decadent dessert combining moist, sweet banana cake studded with chocolate chips. Topped with a rich and creamy peanut butter frosting, the flavors blend harmoniously, balancing fruity sweetness, chocolate richness, and nutty indulgence. Perfect for any occasion, it�s a comforting and irresistible treat!',
            calories: 766,
            prep_time: 75,
            rating: 4.375,
            image: 'https://cdn.sprinklebakes.com/media/2024/04/Banana-Chocolate-Chip-Cake-beauty-5-500x500.jpg',
            instruction:
              '1.Preheat your oven to 350�F (175�C). | 2. In a bowl, mash the bananas and mix with flour, baking soda, sugar, and eggs. | 3. Fold in chocolate chips and pour the batter into a greased pan. | 4. Bake for 30-40 minutes, or until a toothpick comes out clean. | 5. For the peanut butter frosting, beat together peanut butter, powdered sugar, and butter until smooth. | 6. Frost the cooled cake with the peanut butter frosting and serve.'
          },
          {
            _id: '677a995aeb2c723a87474f1d',
            name: 'Beef Tenderloin with Garlic and Brandy ',
            description:
              'Beef Tenderloin with Garlic and Brandy is a luxurious dish highlighting tender, juicy beef cooked to perfection. It�s enhanced with a rich sauce made from garlic, brandy, and often cream or stock, adding deep, aromatic flavors. Elegant and flavorful, this dish is perfect for special occasions or fine dining at home.',
            calories: 174,
            prep_time: 30,
            rating: 4.375,
            image:
              'https://cookingwithwineblog.com/wp-content/uploads/2021/12/Garlic-Thyme-Studded-Beef-Tenderloin-with-Red-Wine-Sauce-Blog-2.jpg',
            instruction:
              '1.Season the beef tenderloin with salt, pepper, and garlic. | 2. Sear the beef in a hot pan with olive oil until browned on all sides. | 3. Remove the beef and set it aside. | 4. In the same pan, deglaze with brandy and let it reduce slightly. | 5. Add cream or stock and simmer until the sauce thickens. | 6. Slice the beef tenderloin and serve with the brandy-garlic sauce.'
          }
        ],
        [
          {
            _id: '677a995aeb2c723a87474f1e',
            name: 'Sweet Buttermilk Spoon Breads ',
            description:
              'Sweet Buttermilk Spoon Breads are a Southern-inspired dish that combines the creaminess of a custard-like texture with the lightness of cornbread. Made with buttermilk, eggs, cornmeal, and a touch of sweetness, the batter is baked until golden and soft enough to scoop with a spoon. This comforting and versatile side pairs beautifully with savory dishes or can be enjoyed as a sweet treat on its own.',
            calories: 146,
            prep_time: 30,
            rating: 1.875,
            image:
              'https://www.foodandwine.com/thmb/8B14J4DBTgIHtzbCrEweP33t4F0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Spoonbread-FT-RECIPE0423-fe54894bc70144168fcbaf6f452d06d5.jpg',
            instruction:
              '1.Preheat your oven to 350�F (175�C). | 2. In a bowl, combine cornmeal, flour, sugar, and baking powder. | 3. Mix in buttermilk, eggs, and melted butter until smooth. | 4. Pour the batter into a greased baking dish and bake for 25-30 minutes, until golden and set. | 5. Serve with a spoon, as the texture should be creamy and custard-like.'
          },
          {
            _id: '677a995aeb2c723a87474f1f',
            name: 'Tomato, Cucumber, and Feta Salad ',
            description:
              'Tomato, Cucumber, and Feta Salad is a refreshing Mediterranean-inspired dish. It combines juicy tomatoes, crisp cucumbers, and tangy feta cheese, often dressed with olive oil, lemon juice, and herbs like oregano or parsley. Light and vibrant, it�s perfect as a side or a healthy, flavorful snack.',
            calories: 196,
            prep_time: 30,
            rating: 4.375,
            image:
              'https://www.eatingwell.com/thmb/Z9oOuheUZB3kGIELHj_Mtp_AFMQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/6569082-a816d2b196294dcd8a152a6940255a9d.jpg',
            instruction:
              '1.Dice the tomatoes and cucumbers. | 2. Crumble the feta cheese and combine all ingredients in a bowl. | 3. Drizzle with olive oil, lemon juice, and season with salt and pepper. | 4. Toss well and serve chilled.'
          },
          {
            _id: '677a995aeb2c723a87474f20',
            name: 'Tomato, Mozzarella, and Basil Salad Glucksman ',
            description:
              'Tomato, Mozzarella, and Basil Salad Glucksman is a twist on the classic Caprese salad, featuring ripe tomatoes, creamy mozzarella, and fragrant basil. The addition of a special dressing or flavor profile, like balsamic glaze or a unique vinaigrette, enhances the dish. Light and fresh, this salad is perfect for showcasing the simplicity and harmony of Italian ingredients.',
            calories: 277,
            prep_time: 45,
            rating: 4.375,
            image:
              'https://www.simplyrecipes.com/thmb/a7yAQ62OEy9Y6CcAXXYT6eJNjvM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Caprese-Salad-LEAD-2-cf7e7e9dbbef46c69c54321bc9bc33e6.jpg',
            instruction:
              '1.Slice the tomatoes and mozzarella. | 2. Arrange the slices on a plate, alternating tomato, mozzarella, and basil leaves. | 3. Drizzle with olive oil, balsamic glaze, and sprinkle with salt and pepper. | 4. Serve immediately or chill for a few minutes.'
          }
        ]
      ]
    }
  }
  async getWorkoutPlanRecommend({ body }: { body: any }) {
    const formData = new FormData()
    formData.append('height', body.height)
    formData.append('weight', body.weight)
    formData.append('age', body.age)
    formData.append('gender', body.gender)
    formData.append('image', body.image)
    formData.append('diseases_info', body.diseases_info)
    formData.append('num_of_exercises', body.num_of_exercises)
    formData.append('dream_weight', body.dream_weight)

    const exercisesRecommend = await axios.post('https://personalized-fitness-recommender-system.onrender.com/api', {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    const result = exercisesRecommend.data.workout_plan.filter(
      (item: any, index: number, self: any) => index === self.findIndex((t: any) => t.id === item.id)
    )

    // Average amount of calories consumed per day
    const calorie_average = body.gender === 'Male' ? 2500 : 2000

    // calo change per day (calories consumed per day)
    const calorieChangePerDay = 200
    //  Recommend Calorie And Time To Achieve Goal
    const { totalCalories, daysToGoal } = recommendCalorieAndTimeToAchieveGoal({
      currentWeight: Number(body.weight),
      desiredWeight: Number(body.dream_weight),
      height: Number(body.height),
      age: Number(body.age),
      gender: body.gender as Gender,
      activityLevel: body?.activityLevel || ActivityLevel.Light
    })

    // totalCalories là tổng lượng calories thâm hụt
    //  Lượng calories cần thâm hụt mỗi ngày

    const calorie_burned_per_day = calorieChangePerDay

    const workout_plan_details = []

    let maxPracticeDays = 5
    const daysToGoalInt = Math.round(daysToGoal)
    for (let i = 1; i <= daysToGoalInt; i++) {
      // Calculate the week number based on the current day
      const week = Math.ceil(i / 7) + 1
      if (maxPracticeDays === 0) {
        workout_plan_details.push({
          sets: [],
          day: i,
          week
        })
        if (i + 1 <= daysToGoalInt) {
          workout_plan_details.push({
            sets: [],
            day: i + 1,
            week
          })
        }
        maxPracticeDays = 5
        i += 2
      }
      workout_plan_details.push({
        sets: getSetExercises({
          exercise_list: result,
          total_calories: calorie_burned_per_day,
          number_of_sets: 2,
          number_exercise_of_set: 2
        }),
        day: i,
        week
      })
      maxPracticeDays--
    }

    let estimated_calories_burned = 0
    workout_plan_details.forEach((detail) => {
      detail.sets.forEach((set) => {
        estimated_calories_burned += set.estimated_calories_burned
      })
    })

    const today = new Date() // Get the current date
    const futureDate = new Date() // Create a copy of the current date
    futureDate.setDate(today.getDate() + daysToGoalInt) // Add 10 days to the current date
    return {
      need: exercisesRecommend.data.need,
      workout_plan: {
        name: 'Plan ' + new Date().getTime(),
        description: '',
        number_of_set: workout_plan_details.length,
        estimated_calories_burned,
        type: WorkoutType.Beginner,
        start_date: today.toISOString(),
        end_date: futureDate.toISOString(),
        estimate_date: daysToGoalInt,
        details: workout_plan_details
      }
    }
  }
}
const recommendService = new RecommendService()
export default recommendService
