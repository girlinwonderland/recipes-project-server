import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import moment = require('moment');
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { SignOptions } from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { TokenService} from '../token/token.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { ITokenPayload } from './interfaces/token-payload';
import { SignInDto } from './dto/signin.dto';
import { IReadableUser } from '../user/interface/readable-user';
import { userSensitiveFieldsEnum } from '../user/enum/ptotected-field.enum';

@Injectable()
export class AuthService {
    private readonly clientAppUrl: string;
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService
    ) {
        this.clientAppUrl = this.configService.get<string>('FRONT_URL')
    }


    private async generateToken(data, options?: SignOptions) : Promise<string>{
        // const accessToken = jwt.sign(data, 'dd', options)
        return this.jwtService.sign(data, options);
    }

    async signUp(createUserDto: CreateUserDto) {
        const { login, password } = createUserDto;
        /** Хешируем пароль */
        const hashPassword = await bcrypt.hash(password, 3);
        /** Создаем пользователя в БД */
        const user = await this.userService.create({ login, password: hashPassword });
        const expiresIn = 60 * 60 * 24; // 24 hours
        const tokenPayload = { _id: user._id };
        const expireAt = moment()
            .add(1, 'day')
            .toISOString();

        const token = await this.generateToken(tokenPayload, { expiresIn });
        await this.saveToken({ token, uId: user._id, expireAt });
        await user.save();

        return true;
    }

    async signIn({ password, login }: SignInDto): Promise<IReadableUser> {
        const user = await this.userService.findByLogin(login);

        if (user && (await bcrypt.compare(password, user.password))) {
            const tokenPayload: ITokenPayload = {
                _id: user._id,
            };
            const token = await this.generateToken(tokenPayload);
            const expireAt = moment()
                .add(1, 'day')
                .toISOString();

            await this.saveToken({
                token,
                expireAt,
                uId: user._id,
            });

            const readableUser = user.toObject() as IReadableUser;
            readableUser.accessToken = token;

            return _.omit<any>(readableUser, Object.values(userSensitiveFieldsEnum)) as IReadableUser;
        }
        throw new BadRequestException('Invalid credentials');
    }

    private async verifyToken(token): Promise<any> {
        try {
            const data = this.jwtService.verify(token);
            const tokenExists = await this.tokenService.exists(data._id, token);

            if (tokenExists) {
                return data;
            }
            throw new UnauthorizedException();
        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    private async saveToken(createUserTokenDto: CreateUserTokenDto) {
        const userToken = await this.tokenService.create(createUserTokenDto);

        return userToken;
    }
}
