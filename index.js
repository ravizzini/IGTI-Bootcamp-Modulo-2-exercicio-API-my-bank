// Utilização do módulo experimental ES Modules para importação. É necessário configurar no package e ao executar a API usar nodemon --experimental-modules ./index.js
//Para realizar debug em experimental modules temos que adicionar flag "runtimeArgs": ["--experimental-modules"] no launch.json

import express from 'express';
//const express = require('express');
import { promises } from 'fs';
//const fs = require('fs').promises; //invocando método nativo do node  filesystem
import winston from 'winston';
//const winston = require('winston');

import accountsRouter from './routes/accounts.js';
//const accountsRouter = require('./routes/accounts.js');

import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './doc.js';

//criação de variavel para uso de promises evita repetição de escrita toda vez que for usar promises
const readFile = promises.readFile;
const writeFile = promises.writeFile;

const app = express();

global.fileName = 'accounts.json'; //criação de variavel global

//criacão de uma varialvel global para os logs com objeto com configurações

const { combine, timestamp, label, printf } = winston.format; // destructuring para facilitar escrita

//criação de formato
const myformat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  //nível de logs - ver 7 níveis na documentação
  level: 'silly',
  //transports indica local onde vão ser salvo os dados neste caso no console e em arquivo
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'my-bank-api.log' }),
  ],
  //definir formato da info do log
  format: combine(label({ label: 'my-bank-api' }), timestamp(), myformat),
});

app.use(express.json());
app.use('/account', accountsRouter); //informa que deve utilizar o router

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, async () => {
  //verificar se existe objeto json se não existir criar json com a estrutura que definirmos. Melhor lugar para verificar é quando a api sobe.

  //try-catch com async await try tenta ler o arquivo com readFile se não conseguir cair no catch(error) e cria um novo arquivo
  try {
    await readFile(global.fileName, 'utf8');
    logger.info('API Started');
  } catch (error) {
    const initialJson = {
      nextId: 1, //nextId cria id incrementado
      accounts: [],
    };

    writeFile(global.fileName, JSON.stringify(initialJson)).catch((error) => {
      logger.error(error);
    });
  }
});
