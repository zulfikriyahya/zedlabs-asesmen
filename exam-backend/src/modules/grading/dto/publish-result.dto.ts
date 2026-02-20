import { IsArray, IsString } from 'class-validator';
export class PublishResultDto {
  @IsArray() @IsString({ each: true }) attemptIds!: string[];
}
