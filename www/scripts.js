$(document).ready(function(){
  // Inicialize os modais do Materialize CSS
  $('.modal').modal();

  function showGreenToast(message) {
    M.toast({html: message, classes: 'green'});
  }
  function showRedToast(message) {
    M.toast({html: message, classes: 'red'});
  }

  // Função para preencher o select de promotoras
  function fillPromotoraSelect(promotoras) {
    const selectPromotora = $('#promotora');
    selectPromotora.empty(); // Limpa as opções atuais
    promotoras.forEach(function(promotora) {
      selectPromotora.append($('<option>', {
        value: promotora.id,
        text: promotora.name
      }));
    });
    // Atualiza o select para que o Materialize CSS reconheça as mudanças
    selectPromotora.formSelect();
  }

  // Requisição GET para /promoters e preenchimento do select de promotoras
  $.get('/api/promoters', function(promotoras) {
    fillPromotoraSelect(promotoras);
  });

  // Aplica a máscara de telefone ao campo #whatsapp
  $('#whatsapp').mask('(00) 00000-0000');

  // Adicione o evento de envio ao formulário de Nova Venda
  $('#orderForm').submit(async function(event) {
    event.preventDefault(); // Evitar o comportamento padrão do formulário

    // Remove a máscara do número de telefone para obter o valor puro
    const rawPhoneNumber = $('#whatsapp').val().replace(/\D/g, '');

    // Verifica se o telefone tem 11 dígitos
    if (rawPhoneNumber.length !== 11) {
      showRedToast('O número de telefone deve ter exatamente 11 dígitos.');
      return;
    }

    // Coleta dos dados do formulário
    const promoterId = $('#promotora').val();
    const customerName = $('#cliente').val();
    const amount = parseInt($('#quantidade').val(), 10); // Converte para número

    // Criação do objeto de dados a ser enviado
    const orderData = {
      promoterid: promoterId,
      amount: amount,
      customer: {
        name: customerName,
        phone: rawPhoneNumber
      }
    };

    try {
      // Fazer a requisição POST para /orders com os dados da venda
      const response = await $.ajax({
        url: '/api/orders',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData)
      });
      console.log(response)

      // Exibir mensagem de venda concluída com sucesso
      showGreenToast('Venda concluída com sucesso!');

      // Preencher modal com detalhes da venda
      $('#transacao').text(response.transaction);
      $('#cliente-nome').text(response.customer);
      $('#edicao-numero').text(response.edition);
      $('#whatsapp-numero').text(response.phone);

      // Limpar lista de grupos inseridos
      $('#grupos-inseridos').empty();
      
      // Preencher lista de grupos inseridos
      response.groups.forEach(function(group) {
        const listItem = $('<li>').text(`Grupo: ${group.group} - ID: ${group.groupid}`);
        $('#grupos-inseridos').append(listItem);
      });

      // Abrir modal de venda concluída
      $('#modal-venda-concluida').modal('open');

    } catch (error) {
      // Exibir a mensagem de erro retornada pelo servidor
      alert('Erro ao enviar a venda: ' + error.responseText);
    }
  });
});
