VENDA: 
{
    promoter_id,
    customer : {
        name,
        phone
    },
    amount

}

Criar Edicão: OK

- Numero da edicao OK
- Valor da edição OK
- Quantidade de Grupos OK
    - Cria os grupos automaticamente OK

Adicionar Cartela:

- id do grupo OK
- numero da cartela OK 
- imagem da cartela OK

Fluxo para criar venda:

    - Consulta se o cliente existe.
        - caso exista pegue o id
        - caso não crie

    - insere a order:
      - promoter_id (enviado na order)
      - customer_id (buscado no banco)
       - group_qtty (enviado no amount da order)
    - Insere a ordergroups
      - Consulta grupos com menos de 10 integrantes
      - insere com a order_id criada anteriormente
      - group_id consultado.

cria um array de retorno com os ordergroups inner join group.pdf

    


------------------------------------------------------
RECURSOS A ADICIONAR

    -   Autenticação
            - numero do telefone > Senha padrao
    -   Unificação dos bolões (Como se fosse dois produtos)
    -   Editar uma venda (Alterar promotor, Editar cliente)
    -   Controle de Cotas (Delete da cota, ediçao de grupo)
    -   Funçao para inativar e Editar promotores
    -   Tela de hisotiroc de vendas (Filtro por edição e ediçao padrao será a ativa)
    -   Pensar em forma de atualizar cliente sem ter impacto
    -   Eliminar cadastro de cliente e deixar nome e telefone na venda
    -   Disparo de resultado, premio e nova venda
