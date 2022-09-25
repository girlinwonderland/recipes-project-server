import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import moment = require('moment');
import * as bcrypt from 'bcrypt';
import { SignOptions } from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { TokenService} from '../token/token.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { ITokenPayload } from './interfaces/token-payload';
import { SignInDto } from './dto/signin.dto';

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

    private async generateAccessToken(data, options?: SignOptions): Promise<string>{
        return this.jwtService.sign(data, options);
    }

    private async generateRefreshToken(data, options?: SignOptions): Promise<string>{
        return this.jwtService.sign(data, options);
    }

    private async saveToken(createUserTokenDto: CreateUserTokenDto) {
        const tokenData = await this.tokenService.find(createUserTokenDto.uId);
        if (tokenData){
            tokenData.token = createUserTokenDto.token;
            return await this.tokenService.update(tokenData.uId, tokenData);
        }
        return await this.tokenService.create(createUserTokenDto);
    }

    async signUp(createUserDto: CreateUserDto): Promise<any> {
        const { login, password } = createUserDto;
        const candidate = await this.userService.findByLogin(login);
        /** Проверка на уже имеющийся в базе логин */
        if (candidate){
            throw new BadRequestException('Username already in use');
        }
        /** Создаем пользователя в БД */
        const user = await this.userService.create({ login, password });

        // const expiresIn = 60 * 60 * 24; // 24 hours
        // const expireInRefresh = 60 * 60 * 24 * 30 // 30 days
        // const tokenPayload = { _id: user._id };
        // const expireAt = moment()
        //     .add(1, 'day')
        //     .toISOString();
        //
        // const accessToken = await this.generateAccessToken(tokenPayload, { expiresIn });
        // const refreshToken = await this.generateRefreshToken(tokenPayload, { expiresIn: expireInRefresh });
        //
        // await this.saveToken({ token: refreshToken, uId: user._id, expireAt });
        await user.save();

        return {
            id: user._id,
            login: user.login,
            posts: user.posts
        }
    }

    async signIn({ password, login }: SignInDto): Promise<any> {
        const user = await this.userService.findByLogin(login);
        if (!user){
            throw new BadRequestException('Пользователь не найден');
        }
        const isPasswordEqual = await bcrypt.compare(password, user.password);
        if (!isPasswordEqual){
            throw new BadRequestException('Неверный пароль');
        }

        const tokenPayload: ITokenPayload = { _id: user._id };

        // const expiresIn = 60 * 60 * 24; // 24 hours
        const expiresIn = 60 * 60 * 24 * 30 // 30 days

        const expireAt = moment()
          .add(1, 'day')
          .toISOString();

        const accessToken = await this.generateAccessToken(tokenPayload);
        const refreshToken = await this.generateRefreshToken(tokenPayload, { expiresIn });

        await this.saveToken({ token: refreshToken, uId: user._id, expireAt });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                login: user.login,
                posts: user.posts
            }
        }


        // if (user && (await bcrypt.compare(password, user.password))) {
        //     const tokenPayload: ITokenPayload = {
        //         _id: user._id,
        //     };
        //     const token = await this.generateToken(tokenPayload);
        //     const expireAt = moment()
        //         .add(1, 'day')
        //         .toISOString();
        //
        //     await this.saveToken({
        //         token,
        //         expireAt,
        //         uId: user._id,
        //     });
        //
        //     const readableUser = user.toObject() as IReadableUser;
        //     readableUser.accessToken = token;
        //
        //     return _.omit<any>(readableUser, Object.values(userSensitiveFieldsEnum)) as IReadableUser;
        // }
    }

    async logOut(refreshToken: string):Promise<any>{
        const token = await this.tokenService.delete(refreshToken);
        return token;
    }

    // async allPosts(refreshToken: string): Promise<any> {
    //     const userData = await this.verifyToken(refreshToken);
    //     return await this.postModel.find({ userId: `${userData._id}` });
    // }

    async refresh(refreshToken: string): Promise<any>{
        if (!refreshToken){
            throw new BadRequestException('Пользователь не авторизован');
        }
        const userData = await this.verifyToken(refreshToken);

        const user = await this.userService.find(userData._id);

        const tokenPayload: ITokenPayload = { _id: userData._id };

        const expiresIn = 60 * 60 * 24; // 24 hours
        const expireInRefresh = 60 * 60 * 24 * 30 // 30 days

        const expireAt = moment()
          .add(1, 'day')
          .toISOString();

        const accessToken = await this.generateAccessToken(tokenPayload, { expiresIn });
        const tokenRefresh = await this.generateRefreshToken(tokenPayload, { expiresIn: expireInRefresh });

        await this.saveToken({ token: tokenRefresh, uId: userData._id, expireAt });

        return {
            accessToken,
            refreshToken,
            user
        }
    }

    private async verifyToken(token): Promise<any> {
        try {
            const data = this.jwtService.verify(token);
            const tokenExists = await this.tokenService.exists(data._id);

            if (tokenExists) {
                return data;
            }
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}
