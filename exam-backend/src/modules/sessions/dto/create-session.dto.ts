import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateSessionDto {
  @IsString() @IsNotEmpty() examPackageId!: string;
  @IsOptional() @IsString() roomId?: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsDateString() startTime!: string;
  @IsDateString() endTime!: string;
}
