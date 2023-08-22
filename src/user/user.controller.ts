import {
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/strategy/guard';

@Controller('api/users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  //we can also get particular data as required like here we are getting email.
  getMe(
    @GetUser() user: User,
    @GetUser('email') email: string,
  ) {
    console.log(email);
    return user;
  }

  //   @Patch()
  //   editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
  //     return this.userService.editUser(userId, dto);
  //   }
}
