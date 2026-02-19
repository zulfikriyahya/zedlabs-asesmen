// ── services/subjects.service.ts ─────────────────────────
@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.subject.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async create(tenantId: string, dto: CreateSubjectDto) {
    const exists = await this.prisma.subject.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (exists) throw new ConflictException(`Kode mata pelajaran '${dto.code}' sudah ada`);
    return this.prisma.subject.create({ data: { tenantId, ...dto } });
  }

  async update(tenantId: string, id: string, dto: UpdateSubjectDto) {
    const subj = await this.prisma.subject.findFirst({ where: { id, tenantId } });
    if (!subj) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const subj = await this.prisma.subject.findFirst({ where: { id, tenantId } });
    if (!subj) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    return this.prisma.subject.delete({ where: { id } });
  }
}
