import { IsNotEmpty, IsString } from 'class-validator';

export class LockDeviceDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
}

export class UnlockDeviceDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
}

export class UpdateDeviceLabelDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
  @IsString() @IsNotEmpty() label!: string;
}
