var express = require('express');
var fs = require('fs').promises; //importando modulo filesystem
var app = express();
var accountsRouter = require('./routes/accounts.js');

global.fileName = 'accounts.json'; //criação de variavel global

app.use(express.json());
app.use('/account', accountsRouter); //informa que deve utilizar o router

app.listen(3000, async () => {
  //verificar se existe objeto json se não existir criar json com a estrutura que definirmos. Melhor lugar para verificar é quando a api sobe.

  //try-catch com async await try tenta ler o arquivo com readFile se não conseguir cair no catch(error) e cria um novo arquivo
  try {
    await fs.readFile(global.fileName, 'utf8');
    console.log('API Started');
  } catch (error) {
    const initialJson = {
      nextId: 1, //nextId cria id incrementado
      accounts: [],
    };

    fs.writeFile(global.fileName, JSON.stringify(initialJson)).catch(
      (error) => {
        console.log(error);
      }
    );
  }
});
