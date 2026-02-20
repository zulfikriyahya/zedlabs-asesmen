import { IsString, IsNotEmpty } from 'class-validator';
export class MarkReadDto {
  @IsString() @IsNotEmpty() notificationId!: string;
}
