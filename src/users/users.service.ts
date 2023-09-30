import { inject, injectable } from 'inversify';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity.js';
import { IUserService } from './users.service.interface';
import { TYPES } from '../types.js';
import { IConfigService } from '../config/config.service.interface';
import { IUsersRepository } from './users.repository.interface';
import { UserModel } from '@prisma/client';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
  ) {}

  async createUser({
    email,
    name,
    password,
  }: UserRegisterDto): Promise<UserModel | null> {
    const newUser = new User(email, name);
    const salt = this.configService.get('SALT');
    await newUser.setPassword(password, Number(salt));

    const existedUser = await this.usersRepository.find(email);
    if (existedUser) {
      return null;
    }
    return this.usersRepository.create(newUser);
  }

  async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
    const existedUser = await this.usersRepository.find(email);
    if (!existedUser) {
      return false;
    }
    const newUser = new User(
      existedUser.email,
      existedUser.name,
      existedUser.password,
    );
    const salt = this.configService.get('SALT');
    return newUser.validatePassword(password);
  }

  async getUserInfo(email: string): Promise<UserModel | null> {
    const existedUser = this.usersRepository.find(email);

    return existedUser;
  }
}
