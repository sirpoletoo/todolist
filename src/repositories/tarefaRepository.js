// src/repositories/TarefaRepository.js

// Importa a instância do banco de dados que foi exportada de db/database.js
const db = require('../db/database');

/**
 * Classe TarefaRepository para interagir com a tabela 'tarefas' no banco de dados.
 * Encapsula todas as operações de acesso a dados para a entidade Tarefa.
 */
class TarefaRepository {

    /**
     * Converte uma linha do banco de dados para o formato de objeto Tarefa esperado.
     * Isso inclui a conversão do INTEGER (0 ou 1) de 'concluida' para um booleano (false ou true).
     * @param {Object} row A linha retornada pelo banco de dados.
     * @returns {Object|null} O objeto Tarefa formatado, ou null se a linha for nula.
     */
    _formatTarefa(row) {
        if (!row) return null;
        return {
            id: row.id,
            titulo: row.titulo,
            descricao: row.descricao,
            dataCriacao: row.dataCriacao,
            dataConclusao: row.dataConclusao,
            concluida: Boolean(row.concluida) // Converte 0 para false, 1 para true
        };
    }

    /**
     * Salva uma nova tarefa no banco de dados.
     * @param {Object} tarefaData Os dados da tarefa a ser salva (sem o ID, que é auto-gerado).
     * @returns {Promise<Object>} Uma Promise que resolve com o objeto Tarefa criado (incluindo o ID gerado).
     */
    async salvar(tarefaData) {
        // Captura o 'this' da instância do TarefaRepository
        const self = this; 

        return new Promise((resolve, reject) => {
            // Converte o booleano 'concluida' para INTEGER (0 ou 1) para o SQLite.
            const concluidaDb = tarefaData.concluida ? 1 : 0;

            db.run(`INSERT INTO tarefas (titulo, descricao, dataCriacao, dataConclusao, concluida) VALUES (?, ?, ?, ?, ?)`,
                [tarefaData.titulo, tarefaData.descricao, tarefaData.dataCriacao, tarefaData.dataConclusao, concluidaDb],
                // Usamos 'function' tradicional aqui para que 'this.lastID' funcione corretamente
                function(err) { 
                    if (err) {
                        console.error("Erro ao salvar tarefa:", err.message);
                        return reject(new Error("Erro ao salvar tarefa no banco de dados."));
                    }
                    // Usamos 'self._formatTarefa' para aceder ao método da instância do Repository
                    resolve(self._formatTarefa({ id: this.lastID, ...tarefaData }));
                }
            );
        });
    }

    /**
     * Busca uma tarefa pelo seu título. Usado para validação de unicidade.
     * @param {string} titulo O título da tarefa a ser buscada.
     * @returns {Promise<Object|null>} Uma Promise que resolve com o objeto Tarefa ou null se não encontrada.
     */
    async buscarPorTitulo(titulo) {
        return new Promise((resolve, reject) => {
            // Arrow function aqui é ok, pois 'db.get' não altera o 'this' para 'this.changes' ou 'this.lastID'
            db.get("SELECT * FROM tarefas WHERE titulo = ?", [titulo], (err, row) => {
                if (err) {
                    console.error(`Erro ao buscar tarefa por título "${titulo}":`, err.message);
                    return reject(new Error(`Erro ao buscar tarefa por título "${titulo}".`));
                }
                resolve(this._formatTarefa(row));
            });
        });
    }

    /**
     * Busca todas as tarefas no banco de dados.
     * @returns {Promise<Array<Object>>} Uma Promise que resolve com um array de objetos Tarefa.
     */
    async buscarTodos() {
        return new Promise((resolve, reject) => {
            // Arrow function aqui é ok
            db.all("SELECT * FROM tarefas", [], (err, rows) => {
                if (err) {
                    console.error("Erro ao buscar todas as tarefas:", err.message);
                    return reject(new Error("Erro ao buscar tarefas no banco de dados."));
                }
                const tarefas = rows.map(row => this._formatTarefa(row));
                resolve(tarefas);
            });
        });
    }

    /**
     * Busca uma tarefa pelo seu ID.
     * @param {number} id O ID da tarefa a ser buscada.
     * @returns {Promise<Object|null>} Uma Promise que resolve com o objeto Tarefa ou null se não encontrada.
     */
    async buscarPorId(id) {
        return new Promise((resolve, reject) => {
            // Arrow function aqui é ok
            db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(`Erro ao buscar tarefa com ID ${id}:`, err.message);
                    return reject(new Error(`Erro ao buscar tarefa com ID ${id}.`));
                }
                resolve(this._formatTarefa(row));
            });
        });
    }

    /**
     * Atualiza uma tarefa existente no banco de dados.
     * @param {number} id O ID da tarefa a ser atualizada.
     * @param {Object} dadosAtualizacao Os campos a serem atualizados.
     * @returns {Promise<Object|null>} Uma Promise que resolve com a tarefa atualizada ou null se não encontrada.
     */
    async atualizar(id, dadosAtualizacao) {
        // Captura o 'this' da instância do TarefaRepository
        const self = this; 

        return new Promise((resolve, reject) => {
            // Converte 'concluida' para INTEGER se estiver presente nos dados de atualização.
            if (typeof dadosAtualizacao.concluida === 'boolean') {
                dadosAtualizacao.concluida = dadosAtualizacao.concluida ? 1 : 0;
            }

            // Constrói a query UPDATE dinamicamente com base nos dados fornecidos.
            const setClauses = [];
            const values = [];
            for (const key in dadosAtualizacao) {
                if (dadosAtualizacao.hasOwnProperty(key)) {
                    setClauses.push(`${key} = ?`);
                    values.push(dadosAtualizacao[key]);
                }
            }

            if (setClauses.length === 0) {
                console.log(`Repository: Nenhum dado para atualizar para ID ${id}.`);
                return resolve(null); // Nada para atualizar
            }

            values.push(id); // Adiciona o ID ao final dos valores para a cláusula WHERE

            db.run(`UPDATE tarefas SET ${setClauses.join(', ')} WHERE id = ?`, values,
                // Usamos 'function' tradicional aqui para que 'this.changes' funcione corretamente
                function(err) { 
                    if (err) {
                        console.error(`Repository: Erro ao executar UPDATE para ID ${id}:`, err.message);
                        return reject(new Error(`Erro ao atualizar tarefa com ID ${id}.`));
                    }

                    console.log(`Repository: UPDATE para ID ${id} afetou ${this.changes} linha(s).`);

                    if (this.changes > 0) {
                        // Arrow function aqui é ok, pois não precisamos do 'this.changes' neste callback
                        db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, row) => {
                            if (err) {
                                console.error(`Repository: Erro ao buscar tarefa atualizada com ID ${id}:`, err.message);
                                return reject(new Error(`Erro ao buscar tarefa atualizada com ID ${id}.`));
                            }
                            // Usamos 'self._formatTarefa' para aceder ao método da instância do Repository
                            resolve(self._formatTarefa(row));
                        });
                    } else {
                        console.log(`Repository: Tarefa com ID ${id} não encontrada ou nenhum dado modificado.`);
                        resolve(null); // Tarefa não encontrada ou nenhum dado alterado
                    }
                }
            );
        });
    }

    /**
     * Exclui uma tarefa do banco de dados.
     * @param {number} id O ID da tarefa a ser excluída.
     * @returns {Promise<boolean>} Uma Promise que resolve para true se a exclusão foi bem-sucedida, false caso contrário.
     */
    async deletar(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM tarefas WHERE id = ?`, [id], function(err) { // 'function' aqui é ok se não usar 'this._formatTarefa'
                if (err) {
                    console.error(`Erro ao deletar tarefa com ID ${id}:`, err.message);
                    return reject(new Error(`Erro ao deletar tarefa com ID ${id}.`));
                }
                // this.changes indica o número de linhas afetadas.
                resolve(this.changes > 0);
            });
        });
    }
}

// Exporta uma instância da classe TarefaRepository para ser usada por outros módulos.
module.exports = new TarefaRepository();
