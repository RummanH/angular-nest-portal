import { SetMetadata } from '@nestjs/common';
import { Role } from '../../modules/users/enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
