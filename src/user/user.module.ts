import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './schemas/user.schema';
import { PostSchema } from './schemas/post.schema';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }])
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
