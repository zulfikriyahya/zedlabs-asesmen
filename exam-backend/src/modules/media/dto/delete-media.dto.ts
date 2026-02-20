import { IsString, IsNotEmpty } from 'class-validator';
export class DeleteMediaDto {
  @IsString() @IsNotEmpty() objectName!: string;
}
