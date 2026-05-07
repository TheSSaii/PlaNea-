import { Injectable } from '@nestjs/common';
import { User } from '../user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }

    return null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
