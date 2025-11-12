import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('create-checkout-session')
  async createCheckout(@Body() dto: CreateCheckoutSessionDto) {
    return this.payments.createCheckoutSession(dto);
  }

  // Basic session fetch for success page; returns amount_total/currency/status when Stripe is enabled.
  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.payments.getSessionPublic(id);
  }
}
