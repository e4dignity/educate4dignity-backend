import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from './donor.entity';
import { Donation } from './donation.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donor) private readonly donors: Repository<Donor>,
    @InjectRepository(Donation) private readonly donations: Repository<Donation>,
  ) {}

  async findOrCreateDonor(input: { email?: string; firstName?: string; lastName?: string; anonymous?: boolean; country?: string; language?: string }) {
    if (input.email) {
      const existing = await this.donors.findOne({ where: { email: input.email } });
      if (existing) return existing;
    }
    const donor = this.donors.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      anonymous: !!input.anonymous,
      country: input.country,
      language: input.language,
    });
    return this.donors.save(donor);
  }

  async recordOpen(sessionId: string, donor: Donor | null, amountCents: number, currency: string, donationType: string, projectId?: string) {
    const existing = await this.donations.findOne({ where: { sessionId } });
    if (existing) return existing;
    const donation = this.donations.create({
      sessionId,
      donor,
      amountCents,
      currency,
      donationType: donationType as any,
      status: 'OPEN' as any,
    });
    return this.donations.save(donation);
  }

  async updateFromSession(sessionId: string, status: 'OPEN'|'COMPLETE'|'EXPIRED', amountCents?: number) {
    const donation = await this.donations.findOne({ where: { sessionId } });
    if (!donation) return;
    donation.status = status as any;
    if (status === 'COMPLETE' && !donation.completedAt) donation.completedAt = new Date();
    if (typeof amountCents === 'number' && amountCents > 0) donation.amountCents = amountCents;
    await this.donations.save(donation);
  }

  async listDonorsAggregates(opts?: { page?: number; pageSize?: number; search?: string }) {
    const page = Math.max(1, opts?.page || 1);
    const pageSize = Math.min(200, Math.max(1, opts?.pageSize || 50));
    const search = (opts?.search || '').trim();

    const qb = this.donations
      .createQueryBuilder('d')
      .leftJoin('d.donor', 'donor')
      .where("d.status = 'COMPLETE'")
      .select('donor.id', 'id')
      .addSelect("COALESCE(TRIM(COALESCE(donor.firstName,'') || ' ' || COALESCE(donor.lastName,'')), donor.email, 'Anonymous')", 'name')
      .addSelect('donor.email', 'email')
      .addSelect('donor.anonymous', 'anonymous')
      .addSelect('SUM(d.amountCents)', 'sumCents')
      .addSelect('COUNT(d.id)', 'countDon')
      .addSelect('MAX(d.completedAt)', 'lastDon')
      .groupBy('donor.id')
      .orderBy('sumCents', 'DESC');

    if (search) {
      // SQLite is case-insensitive for ASCII by default; LIKE is sufficient here.
      qb.having("(LOWER(name) LIKE :s OR LOWER(email) LIKE :s)", { s: `%${search.toLowerCase()}%` });
    }

    qb.offset((page - 1) * pageSize).limit(pageSize);
    const rows = await qb.getRawMany();
    return rows.map(r => ({
      id: r.id,
      name: (r.name || 'Anonymous').trim(),
      email: r.email || undefined,
      anonymous: r.anonymous === 1 || r.anonymous === '1' || r.anonymous === true,
      totalDonated: Math.round((Number(r.sumCents)||0)/100),
      donationsCount: Number(r.countDon)||0,
      lastDonation: r.lastDon || undefined,
    }));
  }

  async donorProfile(id: string) {
    const donor = await this.donors.findOne({ where: { id } });
    if (!donor) return null;
    const donations = await this.donations.find({ where: { donor: { id } }, order: { createdAt: 'DESC' } });
    return { donor, donations };
  }
}
