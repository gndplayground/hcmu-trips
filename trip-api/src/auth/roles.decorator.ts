import { SetMetadata } from '@nestjs/common';
import { Role } from '@/user/user.dto';
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
