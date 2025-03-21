import { ObjectId } from 'mongodb'

interface DishesIngredientsType {
  _id?: ObjectId
  ingredientId: string
  quantity: number
  unit: string
  created_at?: Date
  updated_at?: Date
}

export default class DishesIngredients {
  _id?: ObjectId
  ingredientId: ObjectId
  quantity: number
  unit: string
  created_at?: Date
  updated_at?: Date

  constructor(dishesIngredientsType: DishesIngredientsType) {
    const date = new Date()
    this._id = dishesIngredientsType._id
    this.ingredientId = new ObjectId(dishesIngredientsType.ingredientId)
    this.quantity = dishesIngredientsType.quantity
    this.unit = dishesIngredientsType.unit
    this.created_at = dishesIngredientsType.created_at || date
    this.updated_at = dishesIngredientsType.updated_at || date
  }
}
