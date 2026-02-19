// ── services/question-import.service.ts ──────────────────
@Injectable()
export class QuestionImportService {
  constructor(private questionsSvc: QuestionsService) {}

  async fromJson(tenantId: string, raw: unknown[], createdById: string) {
    // validasi minimal, lalu delegate ke create
    const dto: ImportQuestionsDto = { questions: raw as CreateQuestionDto[] };
    return this.questionsSvc.bulkImport(tenantId, dto, createdById);
  }
}
