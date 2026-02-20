import { IsNotEmpty, IsString } from 'class-validator';
export class RetrySyncDto {
  @IsString() @IsNotEmpty() syncItemId!: string;
}
