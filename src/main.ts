import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as io from 'socket.io';
import * as https from 'https';
import * as fs from 'fs';
// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }

// definimos la ruta
const crPath = '/home/certificate/certificate.pem';
const pkPath = '/home/certificate/private.key';
const caPath = '/home/certificate/ca.pem';
const bdPath = '/home/certificate/ca_bundle.pem';
const options: any = {};
let httpswebsocket = false
let httpsServer, httpsOptions;


if (fs.existsSync(crPath) && fs.existsSync(pkPath) && fs.existsSync(caPath) && fs.existsSync(bdPath)) {
  httpsOptions = {
    cert: fs.readFileSync(crPath),
    key: fs.readFileSync(pkPath),
    ca: [fs.readFileSync(caPath), fs.readFileSync(bdPath)]
  }
  // cargamos los archivos sobre las options
  options.httpsOptions = httpsOptions
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, options);

  app.setGlobalPrefix("api");

  if (fs.existsSync(crPath) && fs.existsSync(pkPath) && fs.existsSync(caPath) && fs.existsSync(bdPath)) {
    httpsServer = https.createServer(httpsOptions);
    app.useWebSocketAdapter(new ExtendedSocketIoAdapter(httpsServer));
    httpswebsocket = true
  }

  const config = new DocumentBuilder()
    .setTitle('Eventually')
    .setDescription('The Eventually API description')
    .setVersion('1.0')
    .addTag('Eventually')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('apidocs', app, document);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();
  if (httpswebsocket){
    httpsServer.listen(4443);
  }
  console.log("Pasó el listen")

  await app.listen(443);
}
bootstrap();


export class ExtendedSocketIoAdapter extends IoAdapter {
  protected ioServer: io.Server;

  constructor(protected server: https.Server) {
      super();

      const options = {
          cors: {
              origin: true,
              methods: ["GET", "POST"],
              credentials: true,
          }
      }

      this.ioServer = new io.Server(server, options);
  }

  create (port: number) {
      console.log('websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead')
      return this.ioServer
  }
}