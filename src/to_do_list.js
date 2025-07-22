const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());


// ENDPOINTS

app.get('/', (req, res) => {
    res.send('Bem vindo a nossa api de To-do List!');
});

// Criar tarefa

app.post('/tarefas', (req, res) => {
    const tarefa = req.body;
    
})