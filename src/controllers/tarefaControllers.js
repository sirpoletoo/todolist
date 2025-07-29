const TarefaService = require('../services/tarefaServices')

class tarefaController {
    async criar (req, res){
        const novaTarefaData = req.body;
        try {
            const tarefaCriada = await TarefaService.criarTarefa(novaTarefaData);
            return res.status(201).json(tarefaCriada);
        } catch (error){
            console.error("Erro no Controller ao criar uma tarefa", error.message);
            return res.status(400).json({ erro: error.message});
        }
    }

    async listar (req, res){
        try{
            const tarefaListadas = await TarefaService.listarTodasTarefas();
            return res.status(200).json(tarefaListadas);
        } catch (error){
            console.error("Erro no Controller ao listar uma tarefa", error.message)
            return res.status(500).json({erro: error.message});
        }
    }

    a// 6. Método para Atualizar Tarefa (PUT /tarefas/:id)
    async atualizar(req, res) {
        // Extrai o ID da URL e os dados de atualização do corpo da requisição.
        const { id } = req.params; 
        const dadosAtualizacao = req.body; 

        try {
            // CORREÇÃO AQUI: Passa o ID (convertido para número) e os dados de atualização para o Service.
            const tarefaAtualizada = await TarefaService.atualizarTarefa(parseInt(id), dadosAtualizacao);

            // Se a tarefa foi encontrada e atualizada, retorna 200 OK.
            if (tarefaAtualizada) {
                return res.status(200).json(tarefaAtualizada);
            } else {
                // Se não foi encontrada, retorna 404.
                return res.status(404).json({ erro: `Tarefa com ID ${id} não encontrada para atualização.` });
            }
        } catch (error) {
            console.error(`Erro no Controller ao atualizar tarefa com ID ${id}:`, error.message);
            // Erros de validação ou outros problemas podem ser 400.
            return res.status(400).json({ erro: error.message });
        }
    }
    async buscarTarefaPorId (req, res){
        const{id} = req.params
        try {
            const tarefaEncontrada = await TarefaService.buscarTarefaPorId(parseInt(id));
            if(tarefaEncontrada){
                return res.status(200).json(tarefaEncontrada)
            } else {
                return res.status(404).json({ erro: `Tarefa com ID ${id} não encontrada.` });
            }
        } catch(error){
            console.error(`Erro no Controller ao listar uma tarefa por ID ${id}`, error.message)
            return res.status(500).json({erro: "Erro interno do servidor ao buscar tarefa"});
        }
    }
    async concluir (req, res){
        const{id} = req.params
        try {
            const concluirTarefa = await TarefaService.concluirTarefa(parseInt(id));
            if(concluirTarefa){
                return res.status(200).json(concluirTarefa)
            } else {
                return res.status(404).json({erro:`Tarefa com ID ${id} não encontrada`})
            }
        } catch (error){
            console.error(`Erro no Controller ao concluir uma tarefa ${id}`, error.message)
            return res.status(500).json({erro: "Erro interno do servidor ao concluir"});
        }
    }

    async excluir(req, res){
        const{id} = req.params
        try{
            const excluirTarefa = await TarefaService.excluirTarefa(parseInt(id));
            if(excluirTarefa){
                return res.status(204).json(excluirTarefa)
            } else {
                return res.status(404).json({erro:`Tarefa com ID ${id} não encontrada`})
            } 
        } catch (error){
            console.error(`Erro no Controller ao excluir uma tarefa ${id}`, error.message)
            return res.status(500).json({erro: "Erro interno do servidor ao excluir"})
        }
        }
    }


module.exports = new tarefaController();
