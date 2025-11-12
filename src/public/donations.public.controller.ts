import { Body, Controller, Get, Query, Post } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { CreateCheckoutSessionDto } from '../payments/dto/create-checkout-session.dto';

@Controller('donations')
export class DonationsPublicController {
  constructor(private payments: PaymentsService) {}

  @Post('checkout-session')
  async create(@Body() body: CreateCheckoutSessionDto){
    return this.payments.createCheckoutSession(body);
  }

  @Get('session-status')
  async sessionStatus(@Query('session_id') id: string){
    const s = await this.payments.getSessionPublic(id);
    // Stripe statuses: 'open' | 'complete' | 'expired' | others; map to spec
    const raw = (s as any).status || 'unknown';
    const status = raw === 'complete' ? 'complete' : raw === 'expired' ? 'expired' : 'open';
    return { status };
  }

  @Get('receipt')
  async receipt(@Query('session_id') id: string){
    // For now reuse getSessionPublic and map minimal receipt fields
    const s = await this.payments.getSessionPublic(id);
    return { receiptUrl: (s as any).receipt_url, amount: (s as any).amount_total, currency: (s as any).currency };
  }
}
