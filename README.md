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

    
