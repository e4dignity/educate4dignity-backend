import { Controller, Get } from '@nestjs/common';

@Controller('public')
export class SummaryController {
  constructor() {}

  @Get('summary')
  async summary(){
    // Static data for Jessica's approach - real impact metrics
    return {
      hero: {
        title: 'Transform menstrual health education in Africa',
        subtitle: 'We break taboos, educate communities, and provide sustainable solutions so every girl can manage her period with dignity.'
      },
      highlights: [],
      metrics: {
        projects: 3, // Jessica's focused projects
        beneficiaries: 500, // Girls directly trained by Jessica
        countries: 1, // Focused on Burundi
      }
    };
  }
}
