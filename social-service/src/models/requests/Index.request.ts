import { RoleTypeQueryFilter } from '~/constants/enums'
import { PaginationReqQuery } from './Pagination.requests'

export interface Filter {
  search: string
  sort_by: string
  order_by: string
}

export interface BaseReqQuery extends PaginationReqQuery, Filter {
  type: RoleTypeQueryFilter
}
