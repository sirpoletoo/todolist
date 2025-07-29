const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
const db = require('./db/database'); 

const tarefaController = require('./controllers/tarefaControllers')

// ENDPOINTS

app.get('/', (req, res) => {
    res.send('Bem vindo a nossa api de To-do List!');
});

app.post('/tarefas', tarefaController.criar);

app.get('/tarefas', tarefaController.listar)

app.put('/tarefas/:id', tarefaController.atualizar)

app.get('/tarefas/:id', tarefaController.buscarTarefaPorId)

app.patch('/tarefas/:id', tarefaController.concluir)

app.delete('/tarefas/:id', tarefaController.excluir)

app.listen (port, ()=> {
    console.log("A API está rodando na porta 3000!")
})

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
        }
        console.log('Conexão com o banco de dados SQLite fechada.');
        process.exit(0); // Encerra o processo Node.js
    });
});
