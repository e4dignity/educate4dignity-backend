import { Controller, Get } from '@nestjs/common';

@Controller('countries')
export class CountriesController {
  constructor() {}

  @Get()
  async list(){
    // Static data for Jessica's approach - focused on Burundi
    return [
      { code: 'BI', name: 'Burundi' },
      { code: 'RW', name: 'Rwanda' },
      { code: 'CD', name: 'DRC' }
    ];
  }
}
