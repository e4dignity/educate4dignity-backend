import { Controller, Get } from '@nestjs/common';

@Controller('public')
export class AboutController {
  @Get('about')
  async about(){
    // Placeholder static content; can be moved to CMS or DB later
    return {
      html: '<h2>About Educate4Dignity</h2><p>We educate communities and provide sustainable menstrual health solutions.</p>',
      team: []
    };
  }
}
