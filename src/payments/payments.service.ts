import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe?: Stripe;
  private siteUrl: string;
  private mockCheckoutUrl?: string;
  private allowedAmountsCents: number[] = [];

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = config.get<string>('STRIPE_SECRET_KEY');
    this.mockCheckoutUrl = config.get<string>('STRIPE_TEST_CHECKOUT_URL');
    // Debug: log whether Stripe secret or test URL are present (do NOT log the secret value)
    // This helps local troubleshooting when the server is started and the env isn't picked up.
    try {
      // eslint-disable-next-line no-console
      console.log('[payments] STRIPE secret present:', !!secretKey, 'STRIPE_TEST_CHECKOUT_URL present:', !!this.mockCheckoutUrl);
    } catch (e) {
      // swallow logging errors in environments where console may be restricted
    }
    if (!secretKey) {
      if (!this.mockCheckoutUrl) {
        throw new Error('Missing STRIPE_SECRET_KEY');
      }
      // Running in mock mode (dev): we will not contact Stripe, only return the provided URL
      // Keep stripe undefined in this mode
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20',
      });
    }
    this.siteUrl = config.get<string>('SITE_URL') || 'http://localhost:5173';

    // Optional: server-enforced donation tiers (in dollars, comma-separated, e.g., "15,50,100")
    const tiers = config.get<string>('ALLOWED_DONATION_AMOUNTS');
    if (tiers) {
      this.allowedAmountsCents = tiers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Math.round(parseFloat(s) * 100))
        .filter((n) => Number.isFinite(n) && n > 0);
    }
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const { amountCents, currency, donationType, projectId, donor } = dto;

    // Enforce amount server-side when tiers are configured
    if (this.allowedAmountsCents.length > 0 && !this.allowedAmountsCents.includes(amountCents)) {
      throw new BadRequestException('Invalid amount');
    }

    // Dev fallback: if STRIPE_SECRET_KEY not configured but STRIPE_TEST_CHECKOUT_URL is provided,
    // return a mock session object that points to that URL.
    if (!this.stripe && this.mockCheckoutUrl) {
      const mockId = 'cs_test_mock_' + Math.random().toString(36).slice(2,10);
      // Persist a local donation record in mock mode
      const donorRec = await this.findOrCreateDonor(donor);
      await this.recordDonation({
        sessionId: mockId,
        donor: donorRec,
        amountCents,
        currency,
        donationType,
        projectId,
      });
      return { id: mockId, url: this.mockCheckoutUrl };
    }

    const metadata: Record<string, string> = {
      projectId,
      donationType,
    };
    if (donor?.email) metadata.email = donor.email;
    if (donor?.firstName) metadata.firstName = donor.firstName;
    if (donor?.lastName) metadata.lastName = donor.lastName;
    if (donor?.anonymous !== undefined) metadata.anonymous = String(donor.anonymous);

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency,
        product_data: {
          name: donationType === 'recurring' ? 'Monthly donation' : 'One-time donation',
          description: projectId.toUpperCase(),
        },
        unit_amount: amountCents,
        recurring: donationType === 'recurring' ? { interval: 'month' } : undefined,
      },
      quantity: 1,
    };

    const name = [donor?.firstName, donor?.lastName].filter(Boolean).join(' ').trim();
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: donationType === 'recurring' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [lineItem],
      success_url: `${this.siteUrl}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.siteUrl}/#/checkout/cancel`,
      metadata,
      customer_email: donor?.email || undefined,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
    };

    // For one-time payments, prefill shipping/contact details when possible
    if (params.mode === 'payment') {
      (params as any).payment_intent_data = {
        shipping: {
          name: name || undefined,
          phone: donor?.phone || undefined,
          address: {
            line1: donor?.address || undefined,
            city: donor?.city || undefined,
            country: donor?.country || undefined,
          },
        },
      };
    }

    const session = await this.stripe!.checkout.sessions.create(params);
    // Persist an OPEN donation record; will be updated on status checks/webhooks
    const donorRec = await this.findOrCreateDonor(donor);
    await this.recordDonation({
      sessionId: session.id,
      donor: donorRec,
      amountCents,
      currency,
      donationType,
      projectId,
    });
    return { id: session.id, url: session.url };
  }

  async getSessionPublic(id: string) {
    if (!this.stripe) {
      // In mock mode, try to read stored donation
  const donation = await this.prisma.donation.findUnique({ where: { sessionId: id } });
  return { id, amount_total: donation?.amountCents, currency: donation?.currency, status: donation?.status || 'unknown' };
    }
    const session = await this.stripe.checkout.sessions.retrieve(id);
    const statusRaw = session.status;
    const mapped: 'OPEN' | 'COMPLETE' | 'EXPIRED' = statusRaw === 'complete' ? 'COMPLETE' : statusRaw === 'expired' ? 'EXPIRED' : 'OPEN';
    // Update stored donation status + amount
    const donation = await this.prisma.donation.findUnique({ where: { sessionId: id } });
    if (donation) {
      await this.prisma.donation.update({
        where: { sessionId: id },
        data: {
          status: mapped,
          completedAt: mapped === 'COMPLETE' && !donation.completedAt ? new Date() : donation.completedAt ?? undefined,
          amountCents: typeof session.amount_total === 'number' ? session.amount_total : donation.amountCents,
        }
      });
    }
    return { id: session.id, amount_total: session.amount_total ?? undefined, currency: session.currency ?? undefined, status: mapped };
  }

  private async findOrCreateDonor(donor?: Record<string, any>): Promise<any | null> {
    if (!donor) return null;
    if (donor.email) {
      const existing = await this.prisma.donor.findUnique({ where: { email: donor.email } });
      if (existing) return existing;
    }
    return this.prisma.donor.create({
      data: {
        email: donor.email,
        name: [donor.firstName, donor.lastName].filter(Boolean).join(' ').trim() || undefined,
        country: donor.country,
      }
    });
  }

  private async recordDonation(args: { sessionId: string; donor: any | null; amountCents: number; currency: string; donationType: string; projectId?: string }) {
    const existing = await this.prisma.donation.findUnique({ where: { sessionId: args.sessionId } });
    if (existing) return existing;
    return this.prisma.donation.create({
      data: {
        sessionId: args.sessionId,
        donorId: args.donor?.id,
        amountCents: args.amountCents,
        currency: args.currency,
        donationType: args.donationType,
        status: 'OPEN',
      }
    });
  }
}
