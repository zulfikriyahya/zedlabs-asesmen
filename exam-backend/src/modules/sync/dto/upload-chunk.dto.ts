import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadChunkDto {
  @IsString() @IsNotEmpty() fileId!: string; // UUID v4 di-generate klien per file
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsInt() @Min(0) @Type(() => Number) chunkIndex!: number;
  @IsInt() @Min(1) @Type(() => Number) totalChunks!: number;
  @IsIn(['image', 'video', 'audio']) type!: 'image' | 'video' | 'audio';
  @IsString() @IsNotEmpty() originalName!: string; // untuk ekstensi file
}
