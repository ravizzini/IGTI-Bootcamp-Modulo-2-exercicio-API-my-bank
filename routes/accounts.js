var express = require('express');
var fs = require('fs');

var router = express.Router(); //cria objeto router para substituir app uma vez que todos endpoint respondem na mesma url

global.fileName = 'accounts.json'; //criação de variavel global

router.post('/', (req, res) => {
  //pegar parametros que estão sendo enviados
  let account = req.body;
  //gravação em arquivo vamos usar o filesystem
  //writeFile cria o arquivo. Como ele espera uma string usamos o método stringify para transformar de JSON para string ou parse para transformar de string para json
  //writeFile recebe 3 parametros ('nome do arquivo', string, função callback erro )
  //o metodo write file cria um novo arquivp e substitui o anterior.
  // Melhor usar o metodo appendFile que cria o primeiro e adiciona os demais.
  // para criar um objeto json corretamente devemo primeiro ler o que foi criado com o metodo readFile para adicionar ao array
  //readFile recebe 3 parametos: nome do arquivo, codificação "utf8", callback

  fs.readFile(global.fileName, 'utf8', (error, data) => {
    //verificar se não houver erro executar

    //para manipular o arquivo temos que transformar a string em json usando JSON.parse
    //usar bloco try-catch para tratamento de erro em caso do arquivo json estar corrompido
    try {
      if (error) throw error;

      let json = JSON.parse(data); // le o arquivo
      //console.log(json);
      // operador ... destructing faz a mesma função que criar as propiedades do objeto name: account.name, balance: account.balance
      account = { id: json.nextId++, ...account }; //constroi o objeto account

      json.accounts.push(account); // inserindo objeto no final do array account

      //escrita do conteudo. Como já foi lido podemos usar o writeFile e reescrever o novo arquivo
      fs.writeFile(global.fileName, JSON.stringify(json), (error) => {
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
  });
});

router.get('/', (_, res) => {
  //ler o arquivo
  fs.readFile(global.fileName, 'utf8', (error, data) => {
    try {
      if (error) throw error;

      // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
      let json = JSON.parse(data);
      delete json.nextId;
      res.send(json);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

router.get('/:id', (req, res) => {
  fs.readFile(global.fileName, 'utf8', (error, data) => {
    try {
      if (error) {
        throw error;
      }

      // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
      let json = JSON.parse(data);
      const account = json.accounts.find(
        (account) => account.id === parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
      ); //usar o metodo find para localizar o objeto com id fornecido no array accounts

      if (account) {
        res.send(account);
      } else {
        res.status(200).send('Conta não localizada');
      }
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

router.delete('/:id', (req, res) => {
  fs.readFile(global.fileName, 'utf8', (error, data) => {
    try {
      if (error) {
        throw error;
      }

      // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID

      let json = JSON.parse(data);
      //é possivel inserir um tratamento de erro aqui caso não exista o id no array
      let accounts = json.accounts.filter(
        (account) => account.id !== parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
      ); //usar o metodo filter para localizar o objeto com id fornecido no array accounts e remover retornando o array sem o objeto
      json.accounts = accounts; // troca o array com todos os registros pelo novo array
      //escreve o novo arquivo
      fs.writeFile(global.fileName, JSON.stringify(json), (error) => {
        if (error) {
          res.status(400).send({ error: error.message });
        } else {
          res.end(); // retorna status 200
        }
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

//put utilizado para atualizar completamente o registro. Patch para atualização parcial

router.put('/', (req, res) => {
  //pegar parametros que estão sendo enviados
  let newAccount = req.body;

  fs.readFile(global.fileName, 'utf8', (error, data) => {
    try {
      if (error) throw error;

      let json = JSON.parse(data); //Lê a informação do arquivo

      let oldIndex = json.accounts.findIndex(
        (account) => account.id === newAccount.id
      ); //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

      json.accounts[oldIndex].name = newAccount.name; //altera a posição do registro com os valores recebidos da requisição
      json.accounts[oldIndex].balance = newAccount.balance;

      fs.writeFile(global.fileName, JSON.stringify(json), (error) => {
        if (error) {
          res.status(400).send({ error: error.message });
        } else {
          res.status(200).send('Conta atualizada');
          //res.end(); // retorna status 200
        }
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

router.post('/transaction', (req, res) => {
  //pegar parametros que estão sendo enviados
  let params = req.body;

  fs.readFile(global.fileName, 'utf8', (error, data) => {
    try {
      if (error) throw error;

      // let json = JSON.parse(data); //Lê a informação do arquivo

      let json = JSON.parse(data);
      let index = json.accounts.findIndex(
        (account) => account.id === params.id
      );

      // let index = json.accounts.findIndex(
      //   (account) => account.id === params.id
      // ); //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

      // prettier-ignore
      if ((params.value < 0) && ((json.accounts[index].balance + params.value) < 0)) {
        throw new Error("Não há saldo suficiente.");
      }

      json.accounts[index].balance += params.value;

      fs.writeFile(global.fileName, JSON.stringify(json), (error) => {
        if (error) {
          res.status(400).send({ error: error.message });
        } else {
          res.send(json.accounts[index]);
          //res.end(); // retorna status 200
        }
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

module.exports = router;
