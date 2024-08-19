$(document).ready(function(){
  // Inicialize os componentes do Materialize
  M.AutoInit();

  // Função para preencher a tabela de edições e atualizar o título
  function fillEditionsTable(editions) {
    const tableBody = $('#editions-table-body');
    tableBody.empty(); // Limpa a tabela atual

    if (editions.length > 0) {
      $('#edition-title').text('Edição ' + editions[0].edition);
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

        // Adiciona a coluna Cotas
        const quotasLink = $('<a>', {
          href: `/quotas?groupid=${group.id}`,
          html: '<i class="material-icons">assignment_ind</i>'
        });
        row.append($('<td>').append(quotasLink));

        tableBody.append(row);
      });
    });
  }

  // Requisição GET para /api/editions/active e preenchimento da tabela de edições
  $.get('/api/editions/active', function(data) {
    console.log('Data received:', data); // Adicionando log de depuração
    fillEditionsTable(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading editions:', textStatus, errorThrown); // Adicionando log de depuração
    alert('Erro ao carregar as edições. Por favor, tente novamente.');
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

    // Fazer a requisição POST para /api/editions com os dados da nova edição
    $.ajax({
      url: '/api/editions',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newEditionData),
      success: function(response) {
        // Fechar o modal após enviar o formulário
        $('#modal-new-edition').modal('close');
        // Mostrar mensagem de sucesso
        M.toast({html: 'Nova edição criada com sucesso!', classes: 'green'});
        // Recarregar as edições para mostrar a nova edição
        $.get('/api/editions/active', function(data) {
          fillEditionsTable(data);
        });
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('Erro ao criar a nova edição. Por favor, tente novamente.');
        console.error('Error creating edition:', textStatus, errorThrown); // Adicionando log de depuração
      }
    });
  });
});
