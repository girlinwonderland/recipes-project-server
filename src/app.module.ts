import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { configModule } from './configure.root';

@Module({
  imports: [
      UserModule, AuthModule,
      configModule,
      MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STRING),
      TokenModule
  ],
})
export class AppModule {}
