import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { SummaryController } from './summary.controller';
import { ContactController } from './contact.controller';
import { DonationsPublicController } from './donations.public.controller';
import { GalleryController } from './gallery.controller';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationService } from '../common/notification.service';
import { AboutController } from './about.controller';
import { NewsletterController } from './newsletter.controller';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    PaymentsModule,
  ],
  controllers: [CountriesController, SummaryController, ContactController, DonationsPublicController, GalleryController, AboutController, NewsletterController, ChatController],
  providers: [NotificationService, ChatService],
})
export class PublicModule {}
