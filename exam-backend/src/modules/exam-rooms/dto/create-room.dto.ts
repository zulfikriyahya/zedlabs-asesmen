import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
export class CreateRoomDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}
