import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
export class ExportFilterDto {
  @IsString() @IsNotEmpty() sessionId!: string;
  @IsOptional() @IsIn(['excel', 'pdf']) format?: 'excel' | 'pdf';
}
