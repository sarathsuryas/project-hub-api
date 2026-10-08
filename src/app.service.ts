import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name, { timestamp: true });

  getHello(): string {
    this.logger.log('getHello() called');
    return 'Hello World!';
  }
}
