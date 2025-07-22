const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'todo.db');


const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if(err){
        console.error('Erro ao abrir banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        createTables(db);
    }
});


function createTables(database) { 
    database.run(` // Corrigido: 'database.run' e fechamento correto da chamada
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            dataCriacao TEXT NOT NULL,
            dataConclusao TEXT,
            concluida INTEGER NOT NULL
        ); // Corrigido: Adicionado ponto e vírgula no final da query SQL
    `, (err) => { 
        if (err) {
            
            console.error('Erro ao criar tabela de tarefas:', err.message);
        } else {
            
            console.log('Tabela de tarefas verificada/criada.');
            
            populateInitialData(database); 
        }
    }); 
}

function populateInitialData(database) {
    
    database.get("SELECT COUNT(*) AS count FROM tarefas", (err, row) => {
        if (err) {
            console.error("Erro ao verificar tarefas existentes:", err.message);
            return;
        }
        // Se a contagem de linhas for 0, a tabela está vazia.
        if (row.count === 0) {
            console.log("Populando dados iniciais de tarefas...");
            const initialTarefas = [
                { titulo: "Comprar pão", descricao: "Pão francês integral", dataCriacao: new Date().toISOString(), dataConclusao: null, concluida: false },
                { titulo: "Estudar JavaScript", descricao: "Revisar Promises e Async/Await", dataCriacao: new Date().toISOString(), dataConclusao: null, concluida: false },
                { titulo: "Pagar contas", descricao: "Água, luz e internet", dataCriacao: new Date().toISOString(), dataConclusao: null, concluida: false }
            ];

            
            initialTarefas.forEach(t => {
                
                database.run(`INSERT INTO tarefas (titulo, descricao, dataCriacao, dataConclusao, concluida) VALUES (?, ?, ?, ?, ?)`,
                    [t.titulo, t.descricao, t.dataCriacao, t.dataConclusao, t.concluida ? 1 : 0],
                    function(err) { 
                        if (err) {
                            console.error(`Erro ao inserir tarefa "${t.titulo}":`, err.message);
                        }
                    }
                );
            });
        }
    });
}


module.exports = db;

