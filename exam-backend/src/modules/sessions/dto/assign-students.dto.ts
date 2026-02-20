import { IsArray, IsString } from 'class-validator';
export class AssignStudentsDto {
  @IsArray() @IsString({ each: true }) userIds!: string[];
}
