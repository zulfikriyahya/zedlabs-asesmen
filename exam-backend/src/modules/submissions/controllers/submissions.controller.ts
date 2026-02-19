// ── controllers/submissions.controller.ts ───────────────
import {
  Controller as SC,
  Get as SG,
  Query as SQ,
  UseGuards as SUG,
  Param as SP,
} from '@nestjs/common';
import { Roles as SR } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@SC('submissions')
@SUG(JwtAuthGuard)
export class SubmissionsController {
  constructor(private svc: SubmissionsService) {}
  @SG()
  @SR(UserRole.TEACHER, UserRole.ADMIN, UserRole.OPERATOR)
  findAll(@TenantId() tid: string, @SQ() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }
}
