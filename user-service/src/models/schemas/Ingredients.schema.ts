import { ObjectId } from 'mongodb'

interface IngredientType {
  _id?: ObjectId
  name: string
  description: string
  calories: number
  image: string
  cab?: number
  sodium?: number
  sugar?: number
  cholesterol?: number
  fat?: number
  protein?: number
  created_at?: Date
  updated_at?: Date
}

export default class Ingredients {
  _id?: ObjectId
  name: string
  description: string
  calories: number
  image: string
  cab?: number
  sodium?: number
  sugar?: number
  cholesterol?: number
  fat?: number
  protein?: number
  created_at?: Date
  updated_at?: Date

  constructor(ingredientType: IngredientType) {
    const date = new Date()
    this._id = ingredientType._id
    this.name = ingredientType.name
    this.description = ingredientType.description
    this.calories = ingredientType.calories
    this.image = ingredientType.image
    this.cab = ingredientType.cab || 0
    this.sodium = ingredientType.sodium || 0
    this.sugar = ingredientType.sugar || 0
    this.cholesterol = ingredientType.cholesterol || 0
    this.fat = ingredientType.fat || 0
    this.protein = ingredientType.protein || 0
    this.created_at = ingredientType.created_at || date
    this.updated_at = ingredientType.updated_at || date
  }
}
