// ── question-tags.module.ts ──────────────────────────────────────

export class CreateTagDto {
  @IsString() @IsNotEmpty() name: string;
}
export class UpdateTagDto extends PartialType(CreateTagDto) {}

@Injectable()
export class QuestionTagsService {
  constructor(private prisma: PrismaService) {}
  findAll(tenantId: string) {
    return this.prisma.questionTag.findMany({ where: { tenantId } });
  }
  async create(tenantId: string, dto: CreateTagDto) {
    const exists = await this.prisma.questionTag.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (exists) throw new ConflictException(`Tag '${dto.name}' sudah ada`);
    return this.prisma.questionTag.create({ data: { tenantId, name: dto.name } });
  }
  async update(tenantId: string, id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.questionTag.findFirst({ where: { id, tenantId } });
    if (!tag) throw new NotFoundException('Tag tidak ditemukan');
    return this.prisma.questionTag.update({ where: { id }, data: dto });
  }
  async remove(tenantId: string, id: string) {
    const tag = await this.prisma.questionTag.findFirst({ where: { id, tenantId } });
    if (!tag) throw new NotFoundException('Tag tidak ditemukan');
    return this.prisma.questionTag.delete({ where: { id } });
  }
}

@Controller('question-tags')
@UseGuards(JwtAuthGuard)
export class QuestionTagsController {
  constructor(private svc: QuestionTagsService) {}
  @Get() findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }
  @Post() @Roles(UserRole.TEACHER, UserRole.ADMIN) create(
    @TenantId() tid: string,
    @Body() dto: CreateTagDto,
  ) {
    return this.svc.create(tid, dto);
  }
  @Patch(':id') @Roles(UserRole.TEACHER, UserRole.ADMIN) update(
    @TenantId() tid: string,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.svc.update(tid, id, dto);
  }
  @Delete(':id') @Roles(UserRole.ADMIN) remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

@Module({
  providers: [QuestionTagsService],
  controllers: [QuestionTagsController],
  exports: [QuestionTagsService],
})
export class QuestionTagsModule {}
