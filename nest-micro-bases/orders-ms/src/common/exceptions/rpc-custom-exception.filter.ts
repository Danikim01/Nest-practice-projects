import { Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException) {
    const rpcError = exception.getError();

    // Para microservicios, simplemente devolvemos el error estructurado
    if (rpcError.toString().includes('Empty response')) {
      return {
        status: 500,
        message: rpcError
          .toString()
          .substring(0, rpcError.toString().indexOf('(') - 1),
      };
    }

    // Manejar errores con estructura de objeto
    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return {
        status,
        message: rpcError.message,
      };
    }

    // Error por defecto
    return {
      status: 400,
      message: rpcError,
    };
  }
}
