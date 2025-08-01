import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetRawHeaders = createParamDecorator((data: string,ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const rawHeaders = req.rawHeaders;
  return rawHeaders;
});
