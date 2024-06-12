$(document).ready(function() {
    // Inicialize os componentes do Materialize
    M.AutoInit();
  
    // Função para formatar data no padrão brasileiro
    function formatDate(dateString) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(dateString).toLocaleString('pt-BR', options);
    }
  
    // Função para preencher a tabela de cotas
    function fillQuotasTable(quotas) {
      const tableBody = $('#quotas-table-body');
      tableBody.empty(); // Limpa a tabela atual
  
      if (quotas.length > 0) {
        $('#quotas-title').text('Cotas do Grupo ' + quotas[0].group);
      } else {
        $('#error-message').text('O grupo não possui cotas vendidas.');
        return;
      }
  
      quotas.forEach(function(quota) {
        const row = $('<tr>');
        row.append($('<td>').text(formatDate(quota.date)));
        row.append($('<td>').text(quota.promoter));
        row.append($('<td>').text(quota.customer));
        row.append($('<td>').text(quota.phone));

        tableBody.append(row);
      });
    }
  
    // Obter o groupid dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('groupid');
  
    if (groupId) {
      // Requisição GET para /api/quotas com o groupid
      $.get('/api/quotas', { groupid: groupId }, function(data) {
        console.log('Dados recebidos:', data); // Log de depuração
        fillQuotasTable(data);
      }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Erro ao carregar cotas:', textStatus, errorThrown); // Log de depuração
        $('#error-message').text('Erro ao carregar as cotas. Por favor, tente novamente.');
      });
    } else {
      $('#error-message').text('Nenhum grupo selecionado.');
    }
  });
  