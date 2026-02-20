import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(ex: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = ex.getStatus();
    const exRes = ex.getResponse();

    const message =
      typeof exRes === 'object' && 'message' in (exRes as object)
        ? (exRes as { message: string | string[] }).message
        : ex.message;

    this.logger.warn(`[${status}] ${req.method} ${req.url} — ${JSON.stringify(message)}`);

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
