import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import clientService from '~/services/client.services'
export const getAllClientController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const clients = await clientService.getAllClient()
  return res.json(clients)
}
