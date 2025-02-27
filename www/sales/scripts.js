$(document).ready(function() {
  // Inicializa os modais do Materialize CSS
  $('.modal').modal();

  // Funções para exibir mensagens
  function showGreenToast(message) {
    M.toast({html: message, classes: 'green'});
  }
  function showRedToast(message) {
    M.toast({html: message, classes: 'red'});
  }

  // Verifica o status da venda ao carregar a página
  $.get('/api/editions/active', function(data) {
    // Se houver uma edição ativa e sale_active for false, substitui o formulário por uma mensagem
    if (data && data.length > 0 && data[0].activeSale === false) {
      $('#orderForm').closest('.row').html('<p class="center-align red-text">Vendas encerradas para essa edição</p>');
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Erro ao buscar edição ativa:', textStatus, errorThrown);
  });

  // Função para preencher o select de promotoras
  function fillPromotoraSelect(promotoras, selectedPromoterId) {
    console.log('promoter: ', selectedPromoterId, 'promotoras: ', promotoras);
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
  console.log(promoterId);

  // Requisição GET para /api/promoters e preenchimento do select de promotoras
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

  // Evento de envio do formulário de Nova Venda
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
    const amount = parseInt($('#quantidade').val(), 10);

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
      // Requisição POST para /api/orders com os dados da venda
      const response = await $.ajax({
        url: '/api/orders',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData)
      });

      // Exibe mensagem de venda concluída com sucesso
      showGreenToast('Venda concluída com sucesso!');

      // Preenche o modal com detalhes da venda
      $('#transacao').text(response.transaction);
      $('#cliente-nome').text(response.customer);
      $('#edicao-numero').text(response.edition);
      $('#whatsapp-numero').text(response.phone);

      // Limpa e preenche a lista de grupos inseridos
      $('#grupos-inseridos').empty();
      response.groups.forEach(function(group) {
        const listItem = $('<li>').text(`Grupo: ${group.group} - ID: ${group.groupid}`);
        $('#grupos-inseridos').append(listItem);
      });

      // Abre o modal de venda concluída e reseta o formulário
      $('#modal-venda-concluida').modal('open');
      $('#orderForm')[0].reset();
      if (promoterId) {
        $('#promotora').val(promoterId).prop('disabled', true).formSelect();
      } else {
        $('#promotora').val('').prop('disabled', false).formSelect();
      }
    } catch (error) {
      // Exibe mensagem de erro
      showRedToast('Erro ao enviar a venda: ' + error.responseText);
    } finally {
      // Reativa o botão de envio e remove a tela de loading
      submitButton.prop('disabled', false).text('Enviar');
      $('#loading-screen').removeClass('progress');
    }
  });

  // Função para exibir o ranking
  function displayRanking(data) {
    const ranking = {};

    // Calcula o número de vendas por promotor
    data.forEach(item => {
      if (ranking[item.promoter]) {
        ranking[item.promoter]++;
      } else {
        ranking[item.promoter] = 1;
      }
    });

    // Converte o objeto ranking em um array de arrays e ordena pelo número de vendas
    const rankingArray = Object.entries(ranking).sort((a, b) => b[1] - a[1]);

    // Preenche o corpo da tabela de ranking
    const rankingBody = $('#ranking-body');
    rankingBody.empty();
    rankingArray.forEach(([promoter, sales]) => {
      const row = $('<tr>');
      row.append($('<td>').text(promoter));
      row.append($('<td>').text(sales));
      rankingBody.append(row);
    });
  }

  // Faz uma requisição GET para /api/quotas para obter os dados das vendas
  $.get('/api/quotas', function(data) {
    displayRanking(data);
  });
});
