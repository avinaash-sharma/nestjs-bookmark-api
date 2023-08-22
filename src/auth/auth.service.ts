/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }
  async signup(dto: AuthDto) {
    //generate the password
    const hash = await argon.hash(dto.password);

    //save the new user to db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;

      //return the saved user
      return user;
    } catch (error) {
      console.error(error.code);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials are already in use');
        }
      }
      throw error;
    }
  }

  //find user by email
  async signin(dto: AuthDto) {
    console.log(
      '🚀 ~ file: auth.service.ts:41 ~ AuthService ~ signin ~ dto:',
      dto,
    );
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    //if does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials are incorrect');
    }
    //compare password
    const passwordMatches = await argon.verify(user.hash, dto.password);
    //if password is not equal throw exception
    if (!passwordMatches) {
      throw new ForbiddenException('Wrong Password');
    }
    //send back user
    //before returning here we are creating a JWT token.
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string,): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );

    return { access_token: token, };
  }
}
