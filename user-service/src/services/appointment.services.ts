import axios from 'axios'
import { envConfig } from '~/constants/config'
import { CreateExpertUserBody } from '~/models/requests/User.requests'
const EXPERT_END_POINT = 'experts'
class AppointmentService {
  async createExpert(expert: CreateExpertUserBody & { userId: string }) {
    const res = await axios.post(envConfig.appointmentServiceHost + '/' + EXPERT_END_POINT + '/create', expert)
    return res.data
  }
}

const appointmentService = new AppointmentService()
export default appointmentService
