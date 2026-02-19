// ── controllers/grading.controller.ts ───────────────────
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class GradingController {
  constructor(
    private svc: GradingService,
    private manualSvc: ManualGradingService,
  ) {}

  @Get() findPending(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findPendingManual(tid, q);
  }

  @Patch('answer') gradeAnswer(@CurrentUser() u: CurrentUserPayload, @Body() dto: GradeAnswerDto) {
    return this.manualSvc.gradeAnswer(dto, u.sub);
  }
  @Post('complete') complete(@Body() dto: CompleteGradingDto) {
    return this.manualSvc.completeGrading(dto);
  }
  @Post('publish') publish(@Body() dto: PublishResultDto) {
    return this.manualSvc.publishResults(dto);
  }
}

@Module({
  providers: [GradingService, ManualGradingService],
  controllers: [GradingController],
  exports: [GradingService],
})
export class GradingModule {}
