// Simula um "banco de dados" em memória para guardar as tarefas
const tarefas = [];

class TarefaControllers {
    async criar(req, res) {
        // Pega os dados do corpo da requisição
        const { titulo, descricao } = req.body;

        // Validação: verifica se o título foi enviado
        if (!titulo) {
            // Se não foi, retorna o erro e para a execução
            return res.status(400).json({ erro: "O titulo da tarefa é obrigatório." });
        }

        // Se a validação passou, cria o novo objeto da tarefa
        const novaTarefa = {
            id: Math.floor(Math.random() * 1000) + 1, // ID aleatório para teste
            titulo: titulo,
            descricao: descricao,
            dataCriacao: new Date().toISOString(),
            concluida: false
        };

        // "Salva" a tarefa no nosso array (simulando o banco de dados)
        tarefas.push(novaTarefa);

        // Retorna a tarefa criada com o status 201 (Created), que indica sucesso na criação.
        return res.status(201).json(novaTarefa);
    }

    // ... outros métodos (listar, buscarPorId, etc.) viriam aqui
}

// Exporta uma instância da classe para ser usada nas rotas
module.exports = new TarefaControllers();