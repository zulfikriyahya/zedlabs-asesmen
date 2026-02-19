// ── exam-packages.module.ts ──────────────────────────────
import { Module } from '@nestjs/common';

@Module({
  providers: [ExamPackagesService, ExamPackageBuilderService, ItemAnalysisService],
  controllers: [ExamPackagesController],
  exports: [ExamPackagesService, ExamPackageBuilderService],
})
export class ExamPackagesModule {}
