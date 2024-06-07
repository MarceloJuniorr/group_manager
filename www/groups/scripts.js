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
  
    $('#addCardForm').submit(function(event) {
      event.preventDefault();
  
      const cardno = $('#cardNo').val();
      const file = $('#picture')[0].files[0];
  
      if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
          const base64data = reader.result.split(',')[1];
          const cardData = {
            cardno: cardno,
            groupid: groupid,
            picture: base64data
          };
  
          $.ajax({
            url: '/api/cardboards',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(cardData),
            success: function(response) {
              $('#modal-add-card').modal('close');
              M.toast({html: `Cartela ${cardno} adicionada com sucesso!`, classes: 'green'});
              // Recarregar as cartelas para mostrar a nova cartela
              $.get(`/api/cardboards?groupid=${groupid}`, function(data) {
                fillCardsTable(data);
              });
            },
            error: function(jqXHR, textStatus, errorThrown) {
              M.toast({html: `Erro ao adicionar a cartela: ${textStatus}`, classes: 'red'});
              console.error('Error adding card:', textStatus, errorThrown);
            }
          });
        };
        reader.readAsDataURL(file);
      } else {
        M.toast({html: 'Por favor, selecione uma imagem.', classes: 'red'});
      }
    });
  });
  