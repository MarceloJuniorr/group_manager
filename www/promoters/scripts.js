$(document).ready(function(){
  // Inicialize os componentes do Materialize
  M.AutoInit();

  // Função para preencher a tabela de promotores
  function fillPromotersTable(promoters) {
    const tableBody = $('#promoters-table-body');
    tableBody.empty(); // Limpa a tabela atual
    
    promoters.forEach(function(promoter) {
      const row = $('<tr>');
      row.append($('<td>').text(promoter.id));
      row.append($('<td>').text(promoter.name));
      row.append($('<td>').text(promoter.phone));

      // Botão "Venda" com ícone
      const salesButton = $('<a>').addClass('btn-small waves-effect waves-light').attr('href', `/sales?promoterid=${promoter.id}`);
      salesButton.append($('<i>').addClass('material-icons').text('shopping_cart'));
      row.append($('<td>').append(salesButton));

      tableBody.append(row);
    });
  }

  // Requisição GET para /api/promoters e preenchimento da tabela de promotores
  $.get('/api/promoters', function(data) {
    fillPromotersTable(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading promoters:', textStatus, errorThrown); // Adicionando log de depuração
    alert('Erro ao carregar os promotores. Por favor, tente novamente.');
  });

  // Evento de envio do formulário de novo promotor
  $('#newPromoterForm').submit(function(event) {
    event.preventDefault(); // Evitar o comportamento padrão do formulário

    // Coleta dos dados do formulário
    const newPromoterData = {
      name: $('#newPromoterName').val(),
      phone: $('#newPromoterPhone').val()
    };

    // Fazer a requisição POST para /api/promoters com os dados do novo promotor
    $.ajax({
      url: '/api/promoters',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newPromoterData),
      success: function(response) {
        // Fechar o modal após enviar o formulário
        $('#modal-new-promoter').modal('close');
        // Mostrar mensagem de sucesso
        M.toast({html: 'Novo promotor criado com sucesso!', classes: 'green'});
        // Recarregar os promotores para mostrar o novo promotor
        $.get('/api/promoters', function(data) {
          fillPromotersTable(data);
        });
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('Erro ao criar o novo promotor. Por favor, tente novamente.');
        console.error('Error creating promoter:', textStatus, errorThrown); // Adicionando log de depuração
      }
    });
  });
});
