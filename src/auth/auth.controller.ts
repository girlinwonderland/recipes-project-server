import { Controller, Post, Get, Body, Res, Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
      private readonly authService: AuthService,
    ) { }

    @Post('/signUp')
    async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<any> {
        const userData = await this.authService.signUp(createUserDto);
        // response.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true } )
        return userData
    }

    @Post('/signIn')
    async signIn(@Body(new ValidationPipe()) signInDto: SignInDto, @Res() response: Response): Promise<any> {
        const userData = await this.authService.signIn(signInDto);
        response.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true } )
        return response.json(userData);
    }

    @Post('/logOut')
    async logOut(@Req() request: Request, @Res() response: Response): Promise<any> {
        const { refreshToken } = request.cookies;
        const token = await this.authService.logOut(refreshToken);
        response.clearCookie('refreshToken');
        return response.json(token);
    }

    @Get('/refresh')
    async refresh(@Req() request: Request, @Res() response: Response): Promise<any>{
        const { refreshToken } = request.cookies;
        const userData = await this.authService.refresh(refreshToken);
        response.clearCookie('refreshToken');
        response.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true } )
        return response.json(userData);
    }

    // @Get('/recipes')
    // async savedRecipes(@Req() request: Request, @Res() response: Response): Promise<any>{
    //     const { refreshToken } = request.cookies;
    //     return await this.authService.allPosts(refreshToken)
    // }

}
