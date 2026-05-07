import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { create: jest.Mock; findByEmail: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
<<<<<<< HEAD

  it('registers a user and returns an access token', async () => {
    const createdUser = buildUser();
    usersService.create.mockReturnValue(createdUser);
    jwtService.signAsync.mockResolvedValue('signed-token');

    const result = await service.register({
      email: 'test@example.com',
      password: 'secret',
      name: 'Test User',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
      }),
    );
    expect(result).toEqual({
      user: createdUser.toPublicJSON(),
      accessToken: 'signed-token',
    });
  });

  it('rejects login when the user does not exist', async () => {
    usersService.findByEmail.mockReturnValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

function buildUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return User.create({
    id: overrides.id ?? 'user-1',
    email: overrides.email ?? 'test@example.com',
    passwordHash:
      overrides.passwordHash ??
      '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567890',
    name: overrides.name ?? 'Test User',
    role: overrides.role,
    createdAt: overrides.createdAt,
    updatedAt: overrides.updatedAt,
  });
}
=======
});
>>>>>>> origin/feature/plan-management
