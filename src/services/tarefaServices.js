const TarefaRepository = require('../repositories/tarefaRepository');

class TarefaService {
   
    constructor(tarefaRepository = TarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    } 

    async criarTarefa(dadosTarefa) {
        
        if (!dadosTarefa.titulo || typeof dadosTarefa.titulo !== 'string' || dadosTarefa.titulo.trim() === '') {
            throw new Error("O título da tarefa é obrigatório.");
        }
        if (dadosTarefa.descricao && typeof dadosTarefa.descricao !== 'string') {
            throw new Error("A descrição da tarefa deve ser um texto.");
        }
        if (dadosTarefa.dataCriacao && isNaN(new Date(dadosTarefa.dataCriacao))) {
            throw new Error("Data de criação inválida. Use um formato como 'YYYY-MM-DDTHH:mm:ssZ'.");
        }
        if (dadosTarefa.dataConclusao && isNaN(new Date(dadosTarefa.dataConclusao))) {
            throw new Error("Data de conclusão inválida. Use um formato como 'YYYY-MM-DDTHH:mm:ssZ'.");
        }

        
        const tarefaExistente = await this.tarefaRepository.buscarPorTitulo(dadosTarefa.titulo.trim());
   
        if (tarefaExistente) {
            throw new Error("Já existe uma tarefa com este título.");
        }

       
        const tarefaParaSalvar = {
            titulo: dadosTarefa.titulo.trim(),
            descricao: dadosTarefa.descricao ? dadosTarefa.descricao.trim() : null,
            dataCriacao: dadosTarefa.dataCriacao || new Date().toISOString(),
            dataConclusao: dadosTarefa.dataConclusao || null,
            concluida: false
        };

        
        const tarefaCriada = await this.tarefaRepository.salvar(tarefaParaSalvar);

        console.log("Service: Tarefa criada e salva no banco de dados:", tarefaCriada);
        return tarefaCriada; // Retorna a tarefa com o ID gerado pelo banco
    }

   

    async listarTodasTarefas() {
        return await this.tarefaRepository.buscarTodos();
        const tarefas = await this.tarefaRepository.buscarTodos();

    }

    async buscarTarefaPorId(id) {
        return await this.tarefaRepository.buscarPorId(id);
    }

    async atualizarTarefa(id, dadosAtualizacao) {
        // --- ADICIONADOS LOGS DE DEBUG AQUI ---
        console.log(`Service: Iniciando atualização para ID ${id}. Dados recebidos:`, dadosAtualizacao);

        // 1. Verificar se a tarefa existe antes de tentar atualizar
        const tarefaExistente = await this.tarefaRepository.buscarPorId(id);
        if (!tarefaExistente) {
            console.log(`Service: Tarefa com ID ${id} NÃO encontrada para atualização.`);
            return null; // Retorna null se a tarefa não existe
        }
        console.log(`Service: Tarefa com ID ${id} encontrada.`, tarefaExistente);


        // 2. Validações de dados de atualização (ex: dataConclusao, tipos)
        if (dadosAtualizacao.dataConclusao && isNaN(new Date(dadosAtualizacao.dataConclusao))) {
            throw new Error("Data de conclusão inválida.");
        }
        // Se tentar marcar como concluída, garantir que dataConclusao é setada
        if (dadosAtualizacao.concluida === true && !dadosAtualizacao.dataConclusao) {
            dadosAtualizacao.dataConclusao = new Date().toISOString(); // Gera a data de conclusão se não for fornecida
            console.log(`Service: dataConclusao gerada automaticamente para ID ${id}.`);
        }
        // Exemplo: não permitir que dataConclusao seja anterior a dataCriacao
        if (dadosAtualizacao.dataConclusao && tarefaExistente.dataCriacao && 
            new Date(dadosAtualizacao.dataConclusao) < new Date(tarefaExistente.dataCriacao)) {
            throw new Error("Data de conclusão não pode ser anterior à data de criação.");
        }
        // Exemplo: se tentar mudar o título, verificar unicidade (PUT substitui tudo)
        if (dadosAtualizacao.titulo && dadosAtualizacao.titulo !== tarefaExistente.titulo) {
            const tarefaComNovoTitulo = await this.tarefaRepository.buscarPorTitulo(dadosAtualizacao.titulo.trim());
            if (tarefaComNovoTitulo && tarefaComNovoTitulo.id !== id) { // Se encontrou outra tarefa com o mesmo título
                throw new Error("Já existe outra tarefa com este título.");
            }
        }


        // 3. Delegar a atualização para o Repository
        console.log(`Service: Chamando Repository.atualizar para ID ${id} com dados:`, dadosAtualizacao);
        const tarefaAtualizada = await this.tarefaRepository.atualizar(id, dadosAtualizacao);
        console.log(`Service: Repository.atualizar retornou para ID ${id}:`, tarefaAtualizada);

        return tarefaAtualizada;
    }

    async concluirTarefa(id) {
        const tarefa = await this.tarefaRepository.buscarPorId(id);
        if (!tarefa) {
            return null;
        }

        if (tarefa.concluida) {
            throw new Error("Tarefa já está concluída.");
        }

        const dadosAtualizacao = {
            concluida: true,
            dataConclusao: new Date().toISOString()
        };

        const tarefaConcluida = await this.tarefaRepository.atualizar(id, dadosAtualizacao);
        return tarefaConcluida;
    }

    async excluirTarefa(id) {
        const sucesso = await this.tarefaRepository.deletar(id);
        return sucesso;
    }
}

// Correção: Exportar uma INSTÂNCIA da classe com parênteses
module.exports = new TarefaService();