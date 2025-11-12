import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DonationsService } from './donations.service';

@Controller('admin/donors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminDonorsController {
  constructor(private readonly donations: DonationsService) {}

  // GET /api/admin/donors
  @Get()
  async list(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('search') search?: string) {
    return this.donations.listDonorsAggregates({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      search: search || undefined,
    });
  }

  // GET /api/admin/donors/:id
  @Get(':id')
  async profile(@Param('id') id: string) {
    const prof = await this.donations.donorProfile(id);
    if (!prof) return { error: 'Not found' };
    return {
      donor: {
        id: prof.donor.id,
        email: prof.donor.email,
        firstName: prof.donor.firstName,
        lastName: prof.donor.lastName,
        anonymous: prof.donor.anonymous,
        country: prof.donor.country,
        language: prof.donor.language,
        createdAt: prof.donor.createdAt,
      },
      donations: prof.donations.map(d => ({
        id: d.id,
        amountCents: d.amountCents,
        currency: d.currency,
        donationType: d.donationType,
        status: d.status,
        createdAt: d.createdAt,
        completedAt: d.completedAt,
      }))
    };
  }
}
