import { IsNotEmpty, IsString } from 'class-validator';
export class CreateTenantDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() code!: string;
  @IsString() @IsNotEmpty() subdomain!: string;
}
