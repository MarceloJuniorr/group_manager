$(document).ready(function(){
  // Inicialize os componentes do Materialize
  M.AutoInit();

  // Função para preencher a tabela de vendas
  function fillOrdersTable(orders) {
    const tableBody = $('#orders-table-body');
    tableBody.empty(); // Limpa a tabela atual
    
    orders.forEach(function(order) {
      const row = $('<tr>');
      row.append($('<td>').text(order.transacao));
      row.append($('<td>').text(order.promoter));
      row.append($('<td>').text(order.customer));
      row.append($('<td>').text(order.phone));
      row.append($('<td>').text(order.amount));
      row.append($('<td>').text(order.edition));
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
});
