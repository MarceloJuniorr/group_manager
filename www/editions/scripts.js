$(document).ready(function(){
  // Inicializa os componentes do Materialize
  M.AutoInit();

  // Variável para armazenar a edição ativa retornada da API
  let activeEdition = '';

  // Função para preencher a tabela de edições, atualizar o título e marcar o status da venda
  function fillEditionsTable(editions) {
    const tableBody = $('#editions-table-body');
    tableBody.empty(); // Limpa a tabela atual

    if (editions.length > 0) {
  // Armazena a edição ativa (usando a primeira edição retornada)
  activeEdition = editions[0].edition;
  $('#edition-title').text('Edição ' + activeEdition);

  // Atualiza o estado do switch com base na propriedade "activeSale"
  if (typeof editions[0].activeSale !== 'undefined') {
    $('#sale-switch').prop('checked', editions[0].activeSale);
  }
}

    editions.forEach(function(edition) {
      edition.groups.forEach(function(group) {
        const row = $('<tr>');
        row.append($('<td>').text(group.id));
        row.append($('<td>').text(group.seqno));
        const pdfLink = $('<a>', {
          href: group.pdf || '#',
          target: group.pdf ? '_blank' : '_self',
          html: '<i class="material-icons ' + (group.pdf ? '' : 'red-text') + '">cloud_download</i>',
          click: function(event) {
            if (!group.pdf) {
              event.preventDefault();
              M.toast({html: 'PDF ainda não está disponível!', classes: 'red'});
            }
          }
        });
        row.append($('<td>').append(pdfLink));
        const editLink = $('<a>', {
          href: `/groups?groupid=${group.id}`,
          html: '<i class="material-icons">edit</i>'
        });
        row.append($('<td>').append(editLink));

        // Coluna Cotas
        const quotasLink = $('<a>', {
          href: `/quotas?groupid=${group.id}`,
          html: '<i class="material-icons">assignment_ind</i>'
        });
        row.append($('<td>').append(quotasLink));

        tableBody.append(row);
      });
    });
  }

  // Requisição GET para obter a edição ativa
  $.get('/api/editions/active', function(data) {
    console.log('Data received:', data);
    fillEditionsTable(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading editions:', textStatus, errorThrown);
    alert('Erro ao carregar as edições. Por favor, tente novamente.');
  });

  // Evento de alteração do switch de venda
  $('#sale-switch').change(function() {
    // Verifica se há uma edição ativa
    if (!activeEdition) {
      M.toast({html: 'Nenhuma edição ativa encontrada.', classes: 'red'});
      $(this).prop('checked', false);
      return;
    }

    // Obtém o novo valor do switch (true = ativa, false = inativa)
    const saleStatus = $(this).is(':checked');

    // Envia a alteração para o endpoint /api/editions/sale
    $.ajax({
      url: '/api/editions/sale',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ edition: activeEdition, sale: saleStatus }),
      success: function(response) {
        M.toast({html: `Venda ${saleStatus ? 'ativada' : 'desativada'} com sucesso!`, classes: 'green'});
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error updating sale status:', textStatus, errorThrown);
        M.toast({html: 'Erro ao atualizar status da venda.', classes: 'red'});
      }
    });
  });

  // Evento de envio do formulário de nova edição
  $('#newEditionForm').submit(function(event) {
    event.preventDefault(); // Evitar o comportamento padrão do formulário

    // Coleta dos dados do formulário
    const newEditionData = {
      edition: $('#newEdition').val(),
      sorteio: $('#newSorteio').val(),
      value: parseInt($('#newValue').val(), 10),
      groupLimit: parseInt($('#newGroupLimit').val(), 10),
      cardboardLimit: parseInt($('#newCardboardLimit').val(), 10),
      groupQtty: parseInt($('#newGroups').val(), 10)
    };

    // Requisição POST para criar nova edição
    $.ajax({
      url: '/api/editions',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newEditionData),
      success: function(response) {
        $('#modal-new-edition').modal('close');
        M.toast({html: 'Nova edição criada com sucesso!', classes: 'green'});
        // Atualiza a lista de edições e o estado do switch
        $.get('/api/editions/active', function(data) {
          fillEditionsTable(data);
        });
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('Erro ao criar a nova edição. Por favor, tente novamente.');
        console.error('Error creating edition:', textStatus, errorThrown);
      }
    });
  });
});
