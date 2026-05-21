document.addEventListener('DOMContentLoaded', function() {
    const formViagem = document.getElementById('form-viagem');
    
    if (formViagem) {
        formViagem.addEventListener('submit', function(event) {
            // Intercepta o envio para realizar a validação no front-end
            event.preventDefault();
            
            // Captura e limpa os valores dos campos
            const origem = document.getElementById('origem').value.trim();
            const destino = document.getElementById('destino').value.trim();
            const dataViagemInput = document.getElementById('data_viagem').value;
            const concurso = document.getElementById('concurso').value.trim();
            const cargo = document.getElementById('cargo').value.trim();
            const dataProvaInput = document.getElementById('data_prova').value;
            
            // Validação: Origem deve ter pelo menos 3 caracteres
            if (origem.length < 3) {
                window.alert('Erro: O campo "Origem" foi preenchido de maneira incorreta. Insira um local válido com pelo menos 3 caracteres.');
                document.getElementById('origem').focus();
                return;
            }
            
            // Validação: Destino deve ter pelo menos 3 caracteres
            if (destino.length < 3) {
                window.alert('Erro: O campo "Destino" foi preenchido de maneira incorreta. Insira um local válido com pelo menos 3 caracteres.');
                document.getElementById('destino').focus();
                return;
            }
            
            // Validação: Data da Viagem
            const dataViagem = new Date(dataViagemInput + 'T00:00:00');
            if (!dataViagemInput || isNaN(dataViagem.getTime())) {
                window.alert('Erro: O campo "Data da Viagem" foi preenchido de maneira incorreta. Insira uma data válida.');
                document.getElementById('data_viagem').focus();
                return;
            }
            
            // Validação: Concurso
            if (concurso.length < 3) {
                window.alert('Erro: O campo "Concurso" foi preenchido de maneira incorreta. Informe a identificação do certame.');
                document.getElementById('concurso').focus();
                return;
            }
            
            // Validação: Cargo
            if (cargo.length < 2) {
                window.alert('Erro: O campo "Cargo Concorrido" foi preenchido de maneira incorreta.');
                document.getElementById('cargo').focus();
                return;
            }
            
            // Validação: Data da Prova
            const dataProva = new Date(dataProvaInput + 'T00:00:00');
            if (!dataProvaInput || isNaN(dataProva.getTime())) {
                window.alert('Erro: O campo "Data da Prova" foi preenchido de maneira incorreta. Insira uma data válida.');
                document.getElementById('data_prova').focus();
                return;
            }
            
            // Validação Lógica: A data da viagem não pode ser posterior à data da prova
            if (dataViagem > dataProva) {
                window.alert('Erro: A "Data da Viagem" não pode ser posterior à "Data da Prova". Verifique as datas informadas.');
                document.getElementById('data_viagem').focus();
                return;
            }
            
            // Feedback de sucesso
            window.alert('Sucesso: Sua viagem para ' + destino + ' foi cadastrada com sucesso!');
            
            // Reseta o formulário após o sucesso
            formViagem.reset();
        });
    }
});
