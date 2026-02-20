import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaService } from '../services/media.service';
import { MediaUploadService } from '../services/media-upload.service';
import { DeleteMediaDto } from '../dto/delete-media.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaSvc: MediaService,
    private uploadSvc: MediaUploadService,
  ) {}

  @Get('presigned/:key')
  @ApiOperation({
    summary: 'Generate presigned URL untuk objek MinIO',
    description:
      'URL berlaku selama MINIO_PRESIGNED_TTL detik (default 1 jam). Key harus di-encode URI.',
  })
  @ApiParam({ name: 'key', description: 'Object key (URI-encoded)' })
  @ApiResponse({ status: 200, description: 'Presigned URL string' })
  getUrl(@Param('key') key: string) {
    return this.mediaSvc.getPresignedUrl(decodeURIComponent(key));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file media langsung (maks 100MB)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: '{ objectName }' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })] }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadSvc.uploadAndQueue(file.buffer, file.originalname, 'image');
  }

  @Delete()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Hapus objek dari MinIO (hanya ADMIN/TEACHER)' })
  @ApiResponse({ status: 200, description: 'Objek berhasil dihapus' })
  remove(@Body() dto: DeleteMediaDto) {
    return this.mediaSvc.delete(dto.objectName);
  }
}
