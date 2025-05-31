import databaseService from './database.services'

class ClientService {
  async getAllClient() {
    const clients = await databaseService.users
      .find(
        {},
        {
          projection: {
            id: true
          }
        }
      )
      .toArray()
    return clients
  }
}

const clientService = new ClientService()
export default clientService
