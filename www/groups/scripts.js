$(document).ready(function(){
  M.AutoInit();

  const urlParams = new URLSearchParams(window.location.search);
  const groupid = urlParams.get('groupid');

  function fillGroupHeader(data) {
    const edition = data.edition;
    const group = data.groups.find(g => g.id === groupid);

    if (group) {
      $('#group-title').text(`Edição ${edition} Grupo ${group.seqno}`);
      if (!group.pdf) {
        $('#pdf-button').addClass('red');
        $('#pdf-button').click(function(event) {
          event.preventDefault();
          M.toast({html: 'PDF ainda não está disponível!', classes: 'red'});
        });
      } else {
        $('#pdf-button').attr('href', group.pdf);
        $('#pdf-button').removeClass('red');
      }
    } else {
      M.toast({html: 'Grupo não encontrado.', classes: 'red'});
    }
  }

  function fillCardsTable(cards) {
    const tableBody = $('#cards-table-body');
    tableBody.empty();

    cards.forEach(function(card) {
      const row = $('<tr>');
      row.append($('<td>').text(card.id));
      row.append($('<td>').text(card.cardno));
      const imageLink = $('<a>', {
        href: card.picture,
        target: '_blank',
        html: '<i class="material-icons">image</i>'
      });
      row.append($('<td>').append(imageLink));
      tableBody.append(row);
    });
  }

  $.get('/api/editions/active', function(data) {
    fillGroupHeader(data[0]);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading edition data:', textStatus, errorThrown);
    M.toast({html: `Erro ao carregar os dados da edição: ${textStatus}`, classes: 'red'});
  });

  $.get(`/api/cardboards?groupid=${groupid}`, function(data) {
    fillCardsTable(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading cards data:', textStatus, errorThrown);
    M.toast({html: `Erro ao carregar as cartelas: ${textStatus}`, classes: 'red'});
  });

  async function uploadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function() {
        const base64data = reader.result.split(',')[1];
        const cardData = {
          cardno: file.name.split('.')[0],
          groupid: groupid,
          picture: base64data
        };

        $.ajax({
          url: '/api/cardboards',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(cardData),
          success: function(response) {
            M.toast({html: `Cartela ${cardData.cardno} adicionada com sucesso!`, classes: 'green'});
            resolve(response);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            M.toast({html: `Erro ao adicionar a cartela ${file.name}: ${textStatus}`, classes: 'red'});
            console.error('Error adding card:', textStatus, errorThrown);
            reject(errorThrown);
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }

  $('#addCardForm').submit(async function(event) {
    event.preventDefault();

    const files = $('#pictures')[0].files;
    if (files.length === 0) {
      M.toast({html: 'Por favor, selecione uma imagem.', classes: 'red'});
      return;
    }

    $('#modal-add-card').modal('close'); // Close modal
    $('#loading-overlay').show(); // Show loading overlay

    for (const file of files) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error('Error during upload:', error);
      }
    }

    $('#loading-overlay').hide(); // Hide loading overlay
    
    // Recarregar as cartelas para mostrar todas as novas cartelas
    $.get(`/api/cardboards?groupid=${groupid}`, function(data) {
      fillCardsTable(data);
    });
  });
});
