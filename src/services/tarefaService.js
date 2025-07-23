

class tarefaService {
    constructor(tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }
    async criarTarefa(novaTarefa) {
        if (!novaTarefa.titulo || typeof novaTarefa.titulo !== 'string')
            return {error: 'Título da tarefa é obrigatório.'};
        if (!novaTarefa.descricao || typeof novaTarefa.descricao !== 'string')
            return {error: 'Descrição da tarefa deve ser um texto.'};
        if (!novaTarefa.dataCriacao || isNaN(new Date(novaTarefa.dataCriacao)))
            return {error: 'Data de criação inválida.'};
        if(!novaTarefa.dataConclusao || isNaN(new Date(novaTarefa.dataConclusao)))
            return {error: 'Data de conclusão inválida.'};
        
    }
}
