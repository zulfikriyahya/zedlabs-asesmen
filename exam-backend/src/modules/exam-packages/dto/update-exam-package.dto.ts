// ── dto/update-exam-package.dto.ts ───────────────────────
import { PartialType } from '@nestjs/mapped-types';
export class UpdateExamPackageDto extends PartialType(CreateExamPackageDto) {}
