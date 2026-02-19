// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/dto/update-session.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { SessionStatus } from '../../../common/enums/exam-status.enum';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional() @IsEnum(SessionStatus) status?: SessionStatus;
}
