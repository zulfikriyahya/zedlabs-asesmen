import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class UploadMediaDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsOptional() @IsString() chunkIndex?: string;
  @IsOptional() @IsString() totalChunks?: string;
  @IsOptional() @IsIn(['image', 'video', 'audio']) type?: 'image' | 'video' | 'audio';
}
