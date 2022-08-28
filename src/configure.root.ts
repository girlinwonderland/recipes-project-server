import { ConfigModule } from '@nestjs/config';
require('dotenv').config();

export const configModule = ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true
});
