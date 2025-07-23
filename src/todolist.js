const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const tarefaService = require('./services/tarefaService');


// ENDPOINTS

app.get('/', (req, res) => {
    res.send('Bem vindo a nossa api de To-do List!');
});

// Criar tarefas /tarefa

app.post('/tarefas', tarefaControllers.criar)


 app.listen(port, () => {
    console.log(`A API está rodando na porta ${port}`)
 })