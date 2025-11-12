import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

type DonorIndexRow = {
  id: string;
  name: string;
  email?: string | null;
  totalDonated: number;
  donationsCount: number;
  lastDonation?: string | null;
  anonymous?: boolean;
};

@Controller('admin/donors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminDonorsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(): Promise<DonorIndexRow[]> {
    // Aggregate donors with totals and last donation; safe even when empty
    const donors = await this.prisma.donor.findMany({ orderBy: { createdAt: 'desc' } });
    if (!donors.length) return [];

    const donorIds = donors.map((d) => d.id);
    const donations = await this.prisma.donation.findMany({
      where: { donorId: { in: donorIds }, status: { in: ['OPEN', 'COMPLETE'] } },
      orderBy: { createdAt: 'desc' },
    });
    const map = new Map<string, DonorIndexRow>();
    donors.forEach((d) => {
      map.set(d.id, {
        id: d.id,
        name: d.name || (d.email ? (d.email.split('@')[0] || 'Donor') : 'Anonyme'),
        email: d.email || undefined,
        totalDonated: 0,
        donationsCount: 0,
        lastDonation: null,
        anonymous: !d.email,
      });
    });
    donations.forEach((tx) => {
      const row = map.get(tx.donorId || '');
      if (!row) return;
      if (tx.status === 'COMPLETE') {
        row.totalDonated += tx.amountCents / 100;
        row.donationsCount += 1;
        if (!row.lastDonation || new Date(tx.createdAt) > new Date(row.lastDonation)) {
          row.lastDonation = tx.createdAt.toISOString();
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const donor = await this.prisma.donor.findUnique({ where: { id } });
    if (!donor) return { donor: null, donations: [] };
    const donations = await this.prisma.donation.findMany({ where: { donorId: id }, orderBy: { createdAt: 'desc' } });
    return { donor, donations };
  }
}
