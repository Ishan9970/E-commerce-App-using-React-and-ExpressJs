import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,   // Import JwtService for token generation
  ) {}

  async register(userDto: CreateUserDto): Promise<{ success: boolean; message: string }> {
    const existingUser = await this.userRepository.findOneBy({ email: userDto.email });
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const user = this.userRepository.create({ ...userDto, password: hashedPassword });
    await this.userRepository.save(user);
    return { success: true, message: 'User registered successfully' };
  }

  async login(email: string, password: string, role: string): Promise<{ success: boolean; token?: string; id?: number; message?: string }> {
    // Find user by email
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

 

    // Generate JWT payload and sign token
    const payload = { id: user.id, email: user.email, role };
    const token = this.jwtService.sign(payload);

    return { success: true, token, id: user.id };
  }
}
