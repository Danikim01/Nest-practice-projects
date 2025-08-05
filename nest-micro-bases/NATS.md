# Integración del proyecto con NATS

## Descripción

NATS es un sistema de mensajería distribuida que actúa como **message broker** para la comunicación entre microservicios. En este proyecto, NATS se utiliza para:

- **Message Broker**: Distribuir mensajes entre microservicios
- **Service Discovery**: Permitir que los servicios se encuentren dinámicamente
- **Load Balancing**: Distribuir la carga entre múltiples instancias de servicios
- **Pub/Sub Pattern**: Implementar comunicación asíncrona entre servicios

## Arquitectura

```
┌─────────────┐    ┌─────────────┐    ┌────────────────┐
│   Gateway   │───▶│   NATS      │───▶│ Microservicios│
│             │    │   Server    │    │                │
└─────────────┘    └─────────────┘    └────────────────┘
```

## Instalación y Configuración

### 1. Levantar servidor NATS con Docker

```bash
# Comando básico
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats

# Con configuración personalizada
docker run -d \
  --name nats-server \
  -p 4222:4222 \
  -p 8222:8222 \
  -v $(pwd)/nats-config.conf:/etc/nats/nats-server.conf \
  nats
```

### 2. Verificar que NATS esté funcionando

```bash
# Verificar logs del contenedor
docker logs nats-server

# Verificar puertos
netstat -an | grep 4222

# Conectar con cliente NATS (si tienes nats-cli instalado)
nats sub "test" &
nats pub "test" "hello"
```

### 3. Configuración de NATS (opcional)

Crear archivo `nats-config.conf`:

```conf
# Configuración básica de NATS
port: 4222
http_port: 8222

# Configuración de clustering (opcional)
cluster {
  port: 6222
  listen: 0.0.0.0:6222
}

# Configuración de logging
logtime: true
debug: false
trace: false
```

## Puertos y Endpoints

| Puerto | Propósito    | Descripción                                  |
| ------ | ------------ | -------------------------------------------- |
| 4222   | NATS Client  | Puerto principal para conexiones de clientes |
| 8222   | HTTP Monitor | Interfaz web para monitoreo y estadísticas   |

## Comandos útiles

### Gestión del contenedor

```bash
# Iniciar NATS
docker start nats-server

# Detener NATS
docker stop nats-server

# Reiniciar NATS
docker restart nats-server

# Ver logs en tiempo real
docker logs -f nats-server

# Eliminar contenedor
docker rm -f nats-server
```

### Monitoreo

```bash
# Acceder a la interfaz web de monitoreo
# Abrir en navegador: http://localhost:8222

# Ver estadísticas via curl
curl http://localhost:8222/varz
curl http://localhost:8222/connz
```

## Integración con NestJS

### 1. Instalar dependencias

```bash
npm install @nestjs/microservices nats
```

### 2. Configurar en el módulo principal

```typescript
// app.module.ts
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "NATS_SERVICE",
        transport: Transport.NATS,
        options: {
          servers: ["nats://localhost:4222"],
        },
      },
    ]),
  ],
})
export class AppModule {}
```

### 3. Ejemplo de uso en servicio

```typescript
// orders.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class OrdersService {
  constructor(
    @Inject("NATS_SERVICE") private readonly natsClient: ClientProxy
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    // Enviar mensaje a través de NATS
    return this.natsClient.emit("order.created", createOrderDto);
  }
}
```

## Patrones de comunicación

### 1. Request-Response

```typescript
// Enviar request y esperar respuesta
const result = await this.natsClient.send("get.product", { id: 1 });
```

### 2. Event-Driven (Pub/Sub)

```typescript
// Publicar evento
await this.natsClient.emit('order.created', orderData);

// Suscribirse a evento
@EventPattern('order.created')
handleOrderCreated(data: CreateOrderDto) {
  // Procesar evento
}
```

## Troubleshooting

### Problemas comunes

1. **NATS no se conecta**

   ```bash
   # Verificar que el puerto esté abierto
   telnet localhost 4222
   ```

2. **Error de conexión en microservicios**

   ```bash
   # Verificar configuración de servidores NATS
   # Asegurar que la URL sea correcta: nats://localhost:4222
   ```

3. **Alto uso de memoria**
   ```bash
   # Verificar estadísticas de conexiones
   curl http://localhost:8222/connz
   ```

## Recursos adicionales

- [Documentación oficial de NATS](https://nats.io/)
- [Imagen Docker de NATS](https://hub.docker.com/_/nats)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [NATS JavaScript Client](https://github.com/nats-io/nats.js)

## Contribución

Para contribuir a la configuración de NATS en este proyecto:

1. Crear una rama feature
2. Realizar cambios en la configuración
3. Actualizar este README si es necesario
4. Crear un Pull Request

---

**Nota**: Este README se actualiza regularmente. Para la versión más reciente, consulta el repositorio principal.
