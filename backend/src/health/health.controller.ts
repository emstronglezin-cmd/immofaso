import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'immofaso-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}