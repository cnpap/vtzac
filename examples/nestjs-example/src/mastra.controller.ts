import { Controller, Sse, Query } from '@nestjs/common';
import { from, map } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';
import { MastraService } from './mastra.service';

@Controller('api/mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  @Sse('sse')
  async sse(@Query('message') message: string) {
    const stream = await this.mastraService.textStream(message);
    return from(stream).pipe(map((data): MessageEvent => ({ data })));
  }
}
