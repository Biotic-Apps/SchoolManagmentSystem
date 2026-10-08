import { Module } from '@nestjs/common';
import { AssignmentResolver } from './assignment-resolver';
import { AssignmentsService } from './assignments.service';
import { UserAccessService } from './user-access.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    AssignmentResolver,
    UserAccessService,
    UsersService,
    AssignmentsService,
  ],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
