$(document).ready(function(){
  // Inicialize os modais do Materialize CSS
  $('.modal').modal();

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

  // Adicione o evento de envio ao formulário de Nova Venda
  $('#orderForm').submit(async function(event) {
    event.preventDefault(); // Evitar o comportamento padrão do formulário

    // Coleta dos dados do formulário
    const promoterId = $('#promotora').val();
    const customerName = $('#cliente').val();
    const customerPhone = $('#whatsapp').val();
    const amount = parseInt($('#quantidade').val(), 10); // Converte para número

    // Criação do objeto de dados a ser enviado
    const orderData = {
      promoterid: promoterId,
      amount: amount,
      customer: {
        name: customerName,
        phone: customerPhone
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

      // Preparar o conteúdo do modal com os links dos grupos
      const modalContent = $('#modal-content');
      modalContent.empty(); // Limpa o conteúdo atual
      response.groups.forEach(function(group) {
        const link = $('<a>', {
          text: group.message,
          href: group.message,
          target: '_blank',
          class: 'group-link'
        });
        modalContent.append(link).append('<br>');
      });

      // Abrir o modal com os links
      $('#responseModal').modal('open');

      $('#modal-form').modal('close'); // Fechar o modal após enviar o formulário
    } catch (error) {
      // Exibir a mensagem de erro retornada pelo servidor
      alert('Erro ao enviar a venda: ' + error.responseText);
    }
  });
});
