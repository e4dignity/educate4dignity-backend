import { IsIn, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsInt()
  @Min(100) // minimum $1.00
  @Max(100000000) // max $1,000,000.00
  amountCents!: number;

  @IsString()
  @IsIn(['usd'])
  currency!: string; // enforce USD for now

  @IsString()
  @IsIn(['one-time', 'recurring'])
  donationType!: 'one-time' | 'recurring';

  @IsString()
  projectId!: string;

  @IsOptional()
  donor?: Record<string, any>;
}
