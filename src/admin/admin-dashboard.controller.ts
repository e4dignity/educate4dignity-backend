import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

// Shape aligned with frontend's DashboardData (see frontend src/services/dashboardService.ts)
type DashboardKpis = {
  projects_active: number;
  collected_month: number;
  collected_total: number;
  spent_month: number;
  spent_total: number;
  beneficiaries_month: number;
  beneficiaries_total: number;
  distribution_bar: number[];
};

type DashboardCharts = {
  months: string[];
  bar: Record<string, number[]>;
  milestones_percent: number[];
  pie_spending: { label: string; value: number; color?: string }[];
};

type DashboardRecentItem = {
  date: string;
  type: string;
  ref: string;
  statut: string;
  montant: number | null | undefined;
  action: string;
};

type DashboardData = {
  kpis: DashboardKpis;
  charts: DashboardCharts;
  recent: DashboardRecentItem[];
};

@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminDashboardController {
  @Get()
  get(): DashboardData {
    // Return static but realistic demo data so the Admin Dashboard works even if DB is down.
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      kpis: {
        projects_active: 4,
        collected_month: 12500,
        collected_total: 184200,
        spent_month: 9300,
        spent_total: 161750,
        beneficiaries_month: 620,
        beneficiaries_total: 8420,
        distribution_bar: [58, 34, 8],
      },
      charts: {
        months,
        bar: {
          Collecte: [8, 10, 12, 9, 14, 11, 13, 12, 10, 9, 15, 16],
          Planifié: [7, 9, 11, 10, 13, 10, 12, 12, 11, 10, 14, 15],
          Dépensé: [6, 8, 10, 8, 11, 9, 10, 11, 9, 8, 12, 13],
        },
        milestones_percent: [65, 42, 78, 33, 90, 55, 72, 48],
        pie_spending: [
          { label: 'Kits & Matériel', value: 45, color: '#f59e0b' },
          { label: 'Formations', value: 25, color: '#10b981' },
          { label: 'Logistique', value: 18, color: '#3b82f6' },
          { label: 'Administration', value: 12, color: '#6366f1' },
        ],
      },
      recent: [
        { date: new Date().toISOString(), type: 'Dépense', ref: 'SUP-8392', statut: 'Validé', montant: 420.5, action: 'Voir' },
        { date: new Date(Date.now()-86400000).toISOString(), type: 'Collecte', ref: 'DON-2025-10-31', statut: 'Reçu', montant: 1200, action: 'Reçu' },
        { date: new Date(Date.now()-2*86400000).toISOString(), type: 'Formation', ref: 'MHM-Buhiga', statut: 'Terminé', montant: null, action: 'Rapport' },
      ],
    };
  }
}
