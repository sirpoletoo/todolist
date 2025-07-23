const tarefaService = require('../services/tarefaService')

class tarefaControllers {
    async criar (req, res){
        const novaTarefa = req.body;

        try {
            const tarefaCriada = await tarefaService.criar(novaTarefa);
            return res.status(201).json(tarefaCriada);
        } catch (error) {
            console.error("Error no Controller ao criar uma tarefa:", error.message);
            return res.status(400).json({error: error.message});
        }
    }
}