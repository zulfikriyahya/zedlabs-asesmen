// ── controllers/subjects.controller.ts ──────────────────
@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private svc: SubjectsService) {}
  @Get() findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }
  @Post() @Roles(UserRole.ADMIN, UserRole.TEACHER) create(
    @TenantId() tid: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.svc.create(tid, dto);
  }
  @Patch(':id') @Roles(UserRole.ADMIN, UserRole.TEACHER) update(
    @TenantId() tid: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.svc.update(tid, id, dto);
  }
  @Delete(':id') @Roles(UserRole.ADMIN) remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

@Module({
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService],
})
export class SubjectsModule {}
