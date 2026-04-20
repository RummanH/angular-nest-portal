import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

export type CreateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: CreateUserData): Promise<User> {
    return this.usersRepository.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByIdWithTokens(id: string): Promise<User | null> {
    return this.usersRepository.findByIdWithTokens(id);
  }

  async emailExists(email: string): Promise<boolean> {
    return this.usersRepository.emailExists(email);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.updateRefreshToken(id, refreshToken);
  }
}
