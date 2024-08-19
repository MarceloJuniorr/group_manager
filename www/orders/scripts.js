$(document).ready(function(){
  // Inicializa todos os componentes do Materialize
  M.AutoInit();

  let currentOrderId = null; // Variável para armazenar o ID da ordem a ser excluída

  // Função para preencher a tabela de vendas
  function fillOrdersTable(orders) {
    const tableBody = $('#orders-table-body');
    tableBody.empty(); // Limpa a tabela atual
    
    orders.forEach(function(order) {
      const row = $('<tr>');
      row.append($('<td>').text(order.transacao));
      row.append($('<td>').text(order.cota));
      row.append($('<td>').text(order.promoter));
      row.append($('<td>').text(order.customer));
      row.append($('<td>').text(order.phone));
      row.append($('<td>').text(order.amount));
      row.append($('<td>').text(order.edition));
      
      const deleteCell = $('<td>');
      const deleteIcon = $('<i class="material-icons red-text text-darken-4">close</i>');
      deleteIcon.css('cursor', 'pointer');
      deleteIcon.on('click', function() {
        currentOrderId = order.transacao; // Armazena o ID da ordem que será excluída
        
        // Atualiza o conteúdo do modal com o nome do cliente e o número da cota
        $('#delete-modal .modal-content h4').text('Confirmar Exclusão');
        $('#delete-modal .modal-content p').html(`Tem certeza de que deseja excluir a venda da cota <strong>${order.cota}</strong> do cliente <strong>${order.customer}</strong>?`);
        
        $('#delete-modal').modal('open'); // Abre o modal de confirmação
      });
      deleteCell.append(deleteIcon);
      row.append(deleteCell);

      tableBody.append(row);
    });
  }

  // Requisição GET para /api/orders e preenchimento da tabela de vendas
  $.get('/api/orders', function(data) {
    console.log('Data received:', data); // Adicionando log de depuração
    fillOrdersTable(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading orders:', textStatus, errorThrown); // Adicionando log de depuração
    M.toast({html: 'Erro ao carregar as vendas. Por favor, tente novamente.', classes: 'red'});
  });

  // Função para enviar a requisição DELETE quando o usuário confirma a exclusão
  $('#confirm-delete').on('click', function() {
    if (currentOrderId) {
      $.ajax({
        url: `/api/orders?orderid=${currentOrderId}`, // Passa o orderid no query params
        type: 'DELETE',
        success: function(result) {
          M.toast({html: 'Venda excluída com sucesso.', classes: 'green'});
          $('#delete-modal').modal('close'); // Fecha o modal
          // Atualiza a tabela removendo a linha correspondente
          $(`#orders-table-body tr:has(td:contains('${currentOrderId}'))`).remove();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error deleting order:', textStatus, errorThrown); // Log de erro
          M.toast({html: 'Erro ao excluir a venda. Por favor, tente novamente.', classes: 'red'});
        }
      });
    }
  });
});
