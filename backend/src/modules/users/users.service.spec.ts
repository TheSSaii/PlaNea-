import { Test, TestingModule } from '@nestjs/testing';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { USERS_REPOSITORY, UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user through the repository', () => {
    const savedUser = buildUser();
    repository.findByEmail.mockReturnValue(null);
    repository.save.mockImplementation((user) => user);

    const user = service.create({
      id: savedUser.id,
      email: '  TEST@EXAMPLE.COM ',
      passwordHash: savedUser.passwordHash,
      name: savedUser.name ?? undefined,
    });

    expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(repository.save).toHaveBeenCalled();
    expect(user.email).toBe('test@example.com');
  });

  it('fails when the email is already registered', () => {
    repository.findByEmail.mockReturnValue(buildUser());

    expect(() =>
      service.create({
        id: 'user-2',
        email: 'test@example.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567890',
        name: 'Another User',
      }),
    ).toThrow('Email is already registered.');
  });

  it('updates a profile and persists the new version', () => {
    const existingUser = buildUser();
    repository.findById.mockReturnValue(existingUser);
    repository.save.mockImplementation((user) => user);

    const updatedUser = service.updateProfile(existingUser.id, {
      name: ' Updated Name ',
    });

    expect(repository.findById).toHaveBeenCalledWith(existingUser.id);
    expect(repository.save).toHaveBeenCalledWith(updatedUser);
    expect(updatedUser.name).toBe('Updated Name');
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
