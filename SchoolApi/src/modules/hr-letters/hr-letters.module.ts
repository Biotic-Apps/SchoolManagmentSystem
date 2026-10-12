import { Module } from '@nestjs/common';
import { StaffModule } from '../staff/staff.module';
import { HrLettersController } from './hr-letters.controller';
import { HrLettersService } from './hr-letters.service';

/** HR letters: templates and staff letter generation (experience, salary, relieving, custom). */
@Module({
  imports: [StaffModule],
  controllers: [HrLettersController],
  providers: [HrLettersService],
})
export class HrLettersModule {}
