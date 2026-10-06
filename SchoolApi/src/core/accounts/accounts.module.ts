import { Global, Module } from '@nestjs/common';
import { AccountProvisioner } from './account-provisioner';

@Global()
@Module({
  providers: [AccountProvisioner],
  exports: [AccountProvisioner],
})
export class AccountsModule {}
