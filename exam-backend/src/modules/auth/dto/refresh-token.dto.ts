// ── dto/refresh-token.dto.ts ─────────────────────────────
export class RefreshTokenDto {
  @IsString() @IsNotEmpty() refreshToken: string;
}
