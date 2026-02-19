// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/controllers/media.controller.ts
// ════════════════════════════════════════════════════════════════════════════
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaService } from '../services/media.service';
import { MediaUploadService } from '../services/media-upload.service';
import { DeleteMediaDto } from '../dto/delete-media.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaSvc: MediaService,
    private uploadSvc: MediaUploadService,
  ) {}

  @Get('presigned/:key')
  getUrl(@Param('key') key: string) {
    return this.mediaSvc.getPresignedUrl(decodeURIComponent(key));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
  remove(@Body() dto: DeleteMediaDto) {
    return this.mediaSvc.delete(dto.objectName);
  }
}
