import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name, { timestamp: true });

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { method, url } = context.switchToHttp().getRequest();
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} +${Date.now() - now}ms`);
      }),
      catchError((error: unknown) => {
        const stack = error instanceof Error ? error.stack : String(error);
        this.logger.error(`${method} ${url} +${Date.now() - now}ms`, stack);
        return throwError(() => error);
      }),
    );
  }
}
