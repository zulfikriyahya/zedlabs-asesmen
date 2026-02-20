import { IsString, IsNotEmpty, IsOptional, IsObject, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
class ExamSettingsDto {
  @IsInt() @Min(1) duration!: number;
  @IsBoolean() shuffleQuestions!: boolean;
  @IsBoolean() shuffleOptions!: boolean;
  @IsBoolean() showResult!: boolean;
  @IsInt() @Min(1) maxAttempts!: number;
  @IsOptional() @IsInt() passingScore?: number;
}
export class CreateExamPackageDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsObject() @Type(() => ExamSettingsDto) settings!: ExamSettingsDto;
}
