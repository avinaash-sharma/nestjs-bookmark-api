import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //nest is express under the hood so if you want to access the headers and all you can import Request from express
  // and can access the headers properties and many more properties. one needs to import @Req from nest/common but should be avoided
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  //this decorator is to provide code according to the requirement like,
  // here i am sending 200 but i can also provide 201 if required.
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
