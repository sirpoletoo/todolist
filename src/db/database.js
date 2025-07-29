const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'todo.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        // Se houver um erro ao tentar abrir ou criar o banco de dados,
        // exibe uma mensagem de erro e encerra a aplicação.
        console.error('Erro ao abrir o banco de dados:', err.message);
        process.exit(1); // Encerra o processo do Node.js com um código de erro
    } else {
        // Se a conexão for bem-sucedida, exibe uma mensagem de sucesso.
        console.log('Conectado ao banco de dados SQLite.');
        // Chama a função para criar as tabelas. Isso garante que as tabelas
        // existam antes que qualquer operação de dados seja tentada.
        createTables(db);
    }
});

function createTables(database) {
    // Comando SQL para criar a tabela 'tarefas'.
    // CREATE TABLE IF NOT EXISTS: Garante que a tabela só será criada se não existir,
    // evitando erros em execuções subsequentes.
    database.run(`
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- id: Chave primária, número inteiro, autoincrementa automaticamente.
            titulo TEXT NOT NULL,                 -- titulo: Texto, não pode ser nulo.
            descricao TEXT,                       -- descricao: Texto, pode ser nulo.
            dataCriacao TEXT NOT NULL,            -- dataCriacao: Texto, para armazenar datas no formato ISO 8601 (ex: "2023-10-27T10:00:00.000Z").
            dataConclusao TEXT,                   -- dataConclusao: Texto, pode ser nulo, para datas de conclusão.
            concluida INTEGER NOT NULL            -- concluida: Número inteiro (0 para false, 1 para true).
        );
    `, (err) => {
        if (err) {
            // Se houver um erro ao criar a tabela, exibe a mensagem.
            console.error('Erro ao criar tabela de tarefas:', err.message);
        } else {
            // Se a tabela for verificada/criada com sucesso, exibe a mensagem.
            console.log('Tabela de tarefas verificada/criada.');
            // Após criar a tabela, tenta popular com dados iniciais.
            populateInitialData(database);
        }
    });
}

function populateInitialData(database) {
    // Verifica se a tabela 'tarefas' tem algum registro.
    // database.get(): Usado para buscar uma única linha de resultado.
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

            // Itera sobre as tarefas iniciais e as insere no banco de dados.
            initialTarefas.forEach(t => {
                // database.run(): Usado para executar comandos SQL que não retornam dados (INSERT, UPDATE, DELETE).
                // Os '?' são placeholders para os valores, o que ajuda a prevenir SQL Injection.
                // Os valores são passados como um array no segundo argumento.
                // t.concluida ? 1 : 0: Converte o booleano (true/false) para inteiro (1/0) para o SQLite.
                database.run(`INSERT INTO tarefas (titulo, descricao, dataCriacao, dataConclusao, concluida) VALUES (?, ?, ?, ?, ?)`,
                    [t.titulo, t.descricao, t.dataCriacao, t.dataConclusao, t.concluida ? 1 : 0],
                    function(err) { // Usa 'function' tradicional para ter acesso ao 'this.lastID'
                        if (err) {
                            console.error(`Erro ao inserir tarefa "${t.titulo}":`, err.message);
                        }
                    }
                );
            });
        }
    });
}

// 5. Exportando a Instância do Banco de Dados
// Isso torna a instância 'db' disponível para outros módulos (arquivos)
// da sua aplicação que precisarem interagir com o banco de dados.
module.exports = db;
