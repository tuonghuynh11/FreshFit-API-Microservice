interface Nutrition {
  calories: number
  fat: number
  sugar: number
  carbohydrates: number
  protein: number
}

export interface FruitRes {
  name: string
  id: number
  family: string
  order: string
  genus: string
  nutritions: Nutrition
}
