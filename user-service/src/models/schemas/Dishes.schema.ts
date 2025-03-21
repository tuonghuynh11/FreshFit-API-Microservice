import { ObjectId } from 'mongodb'
import DishesIngredients from './DishesIngredients.schema'

interface DishesType {
  _id?: ObjectId
  name: string
  description: string
  calories: number
  prep_time: number // seconds
  rating: number
  image: string
  user_id?: ObjectId
  instruction: string
  created_at?: Date
  updated_at?: Date
  ingredients: DishesIngredients[]
}

export default class Dishes {
  _id?: ObjectId
  name: string
  description: string
  calories: number
  prep_time: number // seconds
  rating: number
  image: string
  user_id?: ObjectId
  instruction: string
  created_at?: Date
  updated_at?: Date
  ingredients: DishesIngredients[]

  constructor(dishesType: DishesType) {
    const date = new Date()
    this._id = dishesType._id
    this.name = dishesType.name
    this.description = dishesType.description
    this.calories = dishesType.calories
    this.prep_time = dishesType.prep_time
    this.rating = dishesType.rating
    this.image = dishesType.image
    this.user_id = dishesType.user_id
    this.instruction = dishesType.instruction
    this.created_at = dishesType.created_at || date
    this.updated_at = dishesType.updated_at || date
    this.ingredients = dishesType.ingredients || []
  }
}

// *  name: string
//  *  description: string
//  *  calories: number
//  *  prep_time: number
//  *  rating: number
//  *  image: string

//  *  instruction: string
//  *  ingredients: DishesIngredients[]
