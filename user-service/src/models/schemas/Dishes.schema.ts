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
  fat?: number
  saturatedFat?: number
  cholesterol?: number
  sodium?: number
  carbohydrate?: number
  fiber?: number
  sugar?: number
  protein?: number
  is_active?: boolean // Check dish is deleted
  is_custom?: boolean // Check dish doesn't original
  source_id?: string // Original dish Id
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
  fat?: number
  saturatedFat?: number
  cholesterol?: number
  sodium?: number
  carbohydrate?: number
  fiber?: number
  sugar?: number
  protein?: number
  is_active?: boolean // Check dish is deleted
  is_custom?: boolean // Check dish doesn't original
  source_id?: ObjectId // Original dish Id

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
    this.fat = dishesType.fat || 0
    this.saturatedFat = dishesType.saturatedFat || 0
    this.cholesterol = dishesType.cholesterol || 0
    this.sodium = dishesType.sodium || 0
    this.carbohydrate = dishesType.carbohydrate || 0
    this.fiber = dishesType.fiber || 0
    this.sugar = dishesType.sugar || 0
    this.protein = dishesType.protein || 0
    this.is_active = true
    this.is_custom = true
    this.source_id = dishesType.source_id ? new ObjectId(dishesType.source_id) : undefined
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
