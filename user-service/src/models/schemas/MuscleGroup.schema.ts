export interface IMuscleGroup {
  name: string
  description?: string
  image: string
}

export default class MuscleGroup {
  name: string
  description?: string
  image: string

  constructor(muscleGroup: IMuscleGroup) {
    this.name = muscleGroup.name
    this.description = muscleGroup.description || ''
    this.image = muscleGroup.image || ''
  }
}
