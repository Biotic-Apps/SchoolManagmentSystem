import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

/** Email or phone is required; omit `password` to get a temporary one (shown once). */
export class SetupPrincipalInput extends PickType(CreateUserDto, [
  'name',
  'email',
  'phone',
  'password',
] as const) {}
