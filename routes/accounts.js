var express = require('express');
var fs = require('fs').promises;

var router = express.Router(); //cria objeto router para substituir app uma vez que todos endpoint respondem na mesma url

router.post('/', async (req, res) => {
  //pegar parametros que estão sendo enviados
  let account = req.body;

  try {
    //data da callback passa a ser retornado pela promisse caso ela tenha sucesso. Erro retornado no catch
    let data = await fs.readFile(global.fileName, 'utf8');

    let json = JSON.parse(data); // le o arquivo
    //console.log(json);

    // operador ... destructing faz a mesma função que criar as propiedades do objeto name: account.name, balance: account.balance
    account = { id: json.nextId++, ...account }; //constroi o objeto account
    json.accounts.push(account); // inserindo objeto no final do array account

    //escrita do conteudo. Como já foi lido podemos usar o writeFile e reescrever o novo arquivo
    await fs.writeFile(global.fileName, JSON.stringify(json));

    //res.end(); // retorna status 200
    res.status(200).send('Conta cadastrada com sucesso');
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/', async (_, res) => {
  try {
    //ler o arquivo
    let data = await fs.readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf8');

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

router.delete('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID

    let json = JSON.parse(data);
    //é possivel inserir um tratamento de erro aqui caso não exista o id no array

    let accounts = json.accounts.filter(
      (account) => account.id !== parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    ); //usar o metodo filter para localizar o objeto com id fornecido no array accounts e remover retornando o array sem o objeto

    json.accounts = accounts; // troca o array com todos os registros pelo novo array

    //escreve o novo arquivo

    await fs.writeFile(global.fileName, JSON.stringify(json));

    //res.end(); // retorna status 200
    res.status(200).send('Conta removida com sucesso');
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//put utilizado para atualizar completamente o registro. Patch para atualização parcial

router.put('/', async (req, res) => {
  try {
    //pegar parametros que estão sendo enviados
    let newAccount = req.body;

    let data = await fs.readFile(global.fileName, 'utf8');

    let json = JSON.parse(data); //Lê a informação do arquivo

    let oldIndex = json.accounts.findIndex(
      (account) => account.id === newAccount.id
    ); //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

    json.accounts[oldIndex].name = newAccount.name; //altera a posição do registro com os valores recebidos da requisição
    json.accounts[oldIndex].balance = newAccount.balance;

    await fs.writeFile(global.fileName, JSON.stringify(json));

    res.status(200).send('Conta atualizada');
    //res.end(); // retorna status 200
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post('/transaction', async (req, res) => {
  //pegar parametros que estão sendo enviados

  try {
    let params = req.body;

    let data = await fs.readFile(global.fileName, 'utf8');

    // let json = JSON.parse(data); //Lê a informação do arquivo

    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id === params.id);

    //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

    // prettier-ignore
    if ((params.value < 0) && ((json.accounts[index].balance + params.value) < 0)) {
        throw new Error("Não há saldo suficiente.");
      }

    json.accounts[index].balance += params.value;

    await fs.writeFile(global.fileName, JSON.stringify(json));

    res.send(json.accounts[index]);
    //res.end(); // retorna status 200
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
