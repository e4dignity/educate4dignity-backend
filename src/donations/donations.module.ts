import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from './donor.entity';
import { Donation } from './donation.entity';
import { DonationsService } from './donations.service';
import { AdminDonorsController } from './admin-donors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Donor, Donation])],
  providers: [DonationsService],
  controllers: [AdminDonorsController],
  exports: [DonationsService],
})
export class DonationsModule {}
