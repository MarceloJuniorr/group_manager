$(document).ready(function() {
  // Inicialize os modais do Materialize CSS
  $('.modal').modal();

  // Função para exibir mensagens de sucesso e erro
  function showGreenToast(message) {
    M.toast({html: message, classes: 'green'});
  }
  function showRedToast(message) {
    M.toast({html: message, classes: 'red'});
  }

  // Função para preencher o select de promotoras
  function fillPromotoraSelect(promotoras, selectedPromoterId) {
    console.log('promoter: ',selectedPromoterId, 'promotoras: ', promotoras)
    const selectPromotora = $('#promotora');
    selectPromotora.empty(); // Limpa as opções atuais
    promotoras.forEach(function(promotora) {
      const option = $('<option>', {
        value: promotora.id,
        text: promotora.name
      });
      if (promotora.id === selectedPromoterId) {
        option.attr('selected', 'selected');
      }
      selectPromotora.append(option);
    });
    // Atualiza o select para que o Materialize CSS reconheça as mudanças
    selectPromotora.formSelect();
  }

  // Obtém o promoterid dos parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const promoterId = urlParams.get('promoterid');
  console.log(promoterId)

  // Requisição GET para /promoters e preenchimento do select de promotoras
  $.get('/api/promoters', function(promotoras) {
    fillPromotoraSelect(promotoras, promoterId);

    // Se houver promoterId na URL, desabilitar o campo e mostrar o nome da promotora
    if (promoterId) {
      const selectedPromoter = promotoras.find(p => p.id === promoterId);
      if (selectedPromoter) {
        $('#promoter-name').text(`${selectedPromoter.name}`);
        $('#promotora').prop('disabled', true); 
        $('#promotora').formSelect();     
      }
    }
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
    const selectedPromoterId = $('#promotora').val() || promoterId;
    const customerFirstName = $('#nome').val();
    const customerLastName = $('#sobrenome').val();
    const customerName = `${customerFirstName} ${customerLastName}`;
    const amount = parseInt($('#quantidade').val(), 10); // Converte para número

    // Criação do objeto de dados a ser enviado
    const orderData = {
      promoterid: selectedPromoterId,
      amount: amount,
      customer: {
        name: customerName,
        phone: rawPhoneNumber
      }
    };

    // Desativa o botão de envio e mostra a tela de loading
    const submitButton = $(this).find('button[type="submit"]');
    submitButton.prop('disabled', true).text('Enviando...');
    $('#loading-screen').addClass('progress');

    try {
      // Fazer a requisição POST para /orders com os dados da venda
      const response = await $.ajax({
        url: '/api/orders',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData)
      });

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
      showRedToast('Erro ao enviar a venda: ' + error.responseText);
    } finally {
      // Reativa o botão de envio e esconde a tela de loading
      submitButton.prop('disabled', false).text('Enviar');
      $('#loading-screen').removeClass('progress');
    }
  });
})