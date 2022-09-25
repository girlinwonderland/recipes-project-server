import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule, { cors: { credentials: true, origin: process.env.FRONT_URL } });
  app.use(cookieParser());
  app.use(cors({
    credentials: true,
    origin: [process.env.FRONT_URL, '*'],
  }))
  const options = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('JS Code Api')
      .setDescription('JS Code Video Tutorial endpoints')
      .setVersion('1.0')
      .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT);
}
bootstrap();
