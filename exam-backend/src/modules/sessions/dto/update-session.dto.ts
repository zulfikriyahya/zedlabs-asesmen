import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { SessionStatus } from '../../../common/enums/exam-status.enum';
import { CreateSessionDto } from './create-session.dto';
export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional() @IsEnum(SessionStatus) status?: SessionStatus;
}
