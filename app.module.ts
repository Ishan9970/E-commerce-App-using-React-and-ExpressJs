import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',               // replace with your mysql username
      password: 'root',      // replace with your mysql password
      database: 'new_db',      // replace with your database name
      entities: [User],
      synchronize: true,              // auto-create tables, only for dev
    }),
    AuthModule,
  ],
})
export class AppModule {}
