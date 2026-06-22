import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../core/errors/app-error';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      const err = exception;
      return response.status(err.statusCode).json({
        statusCode: err.statusCode,
        message: err.message,
        error: err.name,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const resObj =
        typeof res === 'object' && res !== null
          ? (res as Record<string, unknown>)
          : {};

      return response.status(status).json({
        statusCode: status,
        message: resObj['message'] || exception.message,
        error: resObj['error'] || exception.name,
      });
    }
    
    if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      exception.code === 'P2002'
    ) {
      const meta = (exception as any).meta;
      const target = meta?.target;
      const targetStr = Array.isArray(target) ? target.join(', ') : 'campo único';
      
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `Conflito de dados: O valor informado para '${targetStr}' já está em uso.`,
        error: 'ConflictError',
      });
    }

    console.error('Unhandled Exception:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
