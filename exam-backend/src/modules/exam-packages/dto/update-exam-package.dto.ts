import { PartialType } from '@nestjs/mapped-types';
import { CreateExamPackageDto } from './create-exam-package.dto';
export class UpdateExamPackageDto extends PartialType(CreateExamPackageDto) {}
