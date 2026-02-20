// ══════════════════════════════════════════════════════════════
// src/modules/exam-packages/exam-packages.module.ts
// ══════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { ExamPackagesController } from './controllers/exam-packages.controller';
import { ExamPackageBuilderService } from './services/exam-package-builder.service';
import { ExamPackagesService } from './services/exam-packages.service';
import { ItemAnalysisService } from './services/item-analysis.service';

@Module({
  providers: [ExamPackagesService, ExamPackageBuilderService, ItemAnalysisService],
  controllers: [ExamPackagesController],
  exports: [ExamPackagesService, ExamPackageBuilderService],
})
export class ExamPackagesModule {}
