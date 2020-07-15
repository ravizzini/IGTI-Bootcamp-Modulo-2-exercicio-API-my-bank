///criação do endoint e uso do modulo filesystem para criar aquivo accounts.json

var express = require('express');
var fs = require('fs'); //importando modulo filesystem
var app = express();

app.use(express.json());

app.post('/account', (req, res) => {
  //pegar parametros que estão sendo enviados
  let account = req.body;
  //gravação em arquivo vamos usar o filesystem
  //writeFile cria o arquivo. Como ele espera uma string usamos o método stringify para transformar de JSON para string ou parse para transformar de string para json
  //writeFile recebe 3 parametros ('nome do arquivo', string, função callback erro )
  //o metodo write file cria um novo arquivp e substitui o anterior.
  // Melhor usar o metodo appendFile que cria o primeiro e adiciona os demais.
  // para criar um objeto json corretamente devemo primeiro ler o que foi criado com o metodo readFile para adicionar ao array
  //readFile recebe 3 parametos: nome do arquivo, codificação "utf8", callback

  fs.readFile('accounts.json', 'utf8', (error, data) => {
    //verificar se não houver erro executar
    if (!error) {
      //para manipular o arquivo temos que transformar a string em json usando JSON.parse
      //usar bloco try-catch para tratamento de erro em caso do arquivo json estar corrompido
      try {
        let json = JSON.parse(data); // le o arquivo
        //console.log(json);
        // operador ... destructing faz a mesma função que criar as propiedades do objeto name: account.name, balance: account.balance
        account = { id: json.nextId++, ...account }; //constroi o objeto account

        json.accounts.push(account); // inserindo objeto no final do array account

        //escrita do conteudo. Como já foi lido podemos usar o writeFile e reescrever o novo arquivo
        fs.writeFile('accounts.json', JSON.stringify(json), (error) => {
          if (error) {
            res.status(400).send({ error: error.message });
          } else {
            //res.send('post account');
            res.end(); // retorna status 200
          }
        });
      } catch (error) {
        //res.send('erro');
        res.status(400).send({ error: error.message });
      }
    } else {
      // console.log('erro na leitura');
      // res.send('erro na leitura');
      res.status(400).send({ error: error.message });
    }
  });
});

app.get('/account', (_, res) => {
  //ler o arquivo
  fs.readFile('accounts.json', 'utf8', (error, data) => {
    if (!error) {
      // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
      let json = JSON.parse(data);
      delete json.nextId;
      res.send(json);
    } else {
      res.status(400).send({ error: error.message });
    }
  });
});

app.listen(3000, function () {
  //verificar se existe objeto json se não existir criar json com a estrutura que definirmos. Melhor lugar para verificar é quando a api sobe.
  try {
    fs.readFile('accounts.json', 'utf8', (error, data) => {
      if (error) {
        const initialJson = {
          nextId: 1, //nextId cria id incrementado
          accounts: [],
        };
        fs.writeFile('accounts.json', JSON.stringify(initialJson), (error) => {
          if (error) {
            console.log(error);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
  console.log('API Started');
});
