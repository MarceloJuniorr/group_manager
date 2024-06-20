$(document).ready(function() {
  // Função para mostrar toast de sucesso ou erro
  function showToast(message, success = true) {
    const classes = success ? 'green' : 'red';
    M.toast({ html: message, classes });
  }

  // Função para preencher a tabela de cotas
  function fillQuotaTable(quotas) {
    const quotaTableBody = $('#quotaTableBody');
    quotaTableBody.empty(); // Limpa a tabela atual

    quotas.forEach(function(quota) {
      const row = $('<tr>');
      row.append($('<td>').text(quota.group));
      row.append($('<td>').text(new Date(quota.date).toLocaleString()));
      row.append($('<td>').text(quota.transacao));
      row.append($('<td>').text(quota.customer));
      row.append($('<td>').text(quota.phone));

      const messageButton = $('<button>')
        .addClass(`btn waves-effect waves-light ${quota.sended ? 'red' : 'green'}`)
        .append($('<i>').addClass('material-icons').text('message'))
        .click(async function() {
          try {
            const response = await $.ajax({
              url: '/api/message',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({ ogid: quota.transacao })
            });
            showToast('Mensagem enviada com sucesso!', true);
          } catch (error) {
            console.log(error);
            showToast(`Erro ao enviar mensagem. : ${error.responseJSON.message}`, false);
          }
        //  setTimeout(() => {
        //    location.reload();
        //  }, 3000);
        });

      row.append($('<td>').append(messageButton));
      quotaTableBody.append(row);
    });
  }

  // Função para obter o groupid da URL
  function getGroupIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('groupid');
  }

  // Obter o groupid da URL, se existir
  const groupId = getGroupIdFromUrl();

  // Requisição GET para /api/quotas com ou sem groupid
  let apiUrl = '/api/quotas';
  if (groupId) {
    apiUrl += `?groupid=${groupId}`;
  }

  $.get(apiUrl, function(quotas) {
    fillQuotaTable(quotas);
  });
});