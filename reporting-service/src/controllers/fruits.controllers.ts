import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { FRUIT_MESSAGES } from '~/constants/messages'
import fruitService from '~/services/fruit.sevices'

export const getFruitInformationByByNameController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  // return res.json({
  //   message: FRUIT_MESSAGES.GET_FRUIT_SUCCESS,
  //   fruit: {}
  // })

  const { name } = req.params
  const result = await fruitService.getByName(name.trim().toLocaleLowerCase())
  return res.json({
    message: FRUIT_MESSAGES.GET_FRUIT_SUCCESS,
    fruit: result
  })
}
