import { IsIn, IsString } from 'class-validator';

export class GetTokenDto {
  @IsString()
  client_id!: string;

  @IsString()
  client_secret!: string;

  @IsString()
  @IsIn(['client_credentials'])
  grant_type!: string;
}
