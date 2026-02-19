// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/dto/create-session.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { SessionStatus } from '../../../common/enums/exam-status.enum';

export class CreateSessionDto {
  @IsString() @IsNotEmpty() examPackageId: string;
  @IsOptional() @IsString() roomId?: string;
  @IsString() @IsNotEmpty() title: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional() @IsEnum(SessionStatus) status?: SessionStatus;
}

export class AssignStudentsDto {
  @IsString({ each: true }) userIds: string[];
}
