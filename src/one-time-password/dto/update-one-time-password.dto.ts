import { PartialType } from '@nestjs/mapped-types';
import { CreateOneTimePasswordDto } from './create-one-time-password.dto';

export class UpdateOneTimePasswordDto extends PartialType(CreateOneTimePasswordDto) {}
