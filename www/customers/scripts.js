$(document).ready(function(){
    // Realiza a requisição GET para /api/customers
    $.get('/api/customers', function(data) {
      const customersTableBody = $('#customers-table-body');
      
      // Limpa o corpo da tabela antes de preencher os dados
      customersTableBody.empty();
  
      // Preenche a tabela com os dados retornados
      data.forEach(function(customer) {
        const row = $('<tr>');
        row.append($('<td>').text(customer.id));
        row.append($('<td>').text(customer.name));
        row.append($('<td>').text(customer.phone));
        customersTableBody.append(row);
      });
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Erro ao carregar os clientes:', textStatus, errorThrown);
      alert('Erro ao carregar os clientes.');
    });
  });
  