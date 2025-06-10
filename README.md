# TP04 - Visualizador de Tabela Hash Extensível
## Visão Geral do Projeto
Este repositório contém o desenvolvimento de um trabalho prático para a disciplina de Algoritmos e Estruturas de Dados. O projeto consiste em uma aplicação web interativa que demonstra o funcionamento de uma Tabela Hash Extensível, uma estrutura de dados dinâmica que cresce e encolhe de acordo com a necessidade de armazenamento, sendo uma excelente alternativa para manipulação de grandes volumes de dados em disco.

O objetivo principal é oferecer uma ferramenta visual e didática que facilite o entendimento dos processos complexos envolvidos na manipulação dessa estrutura, como a inserção de chaves, a divisão de buckets (cestos) e a duplicação do diretório.

## Como Executar
A aplicação foi desenvolvida com HTML, CSS e JavaScript puros, sem a necessidade de bibliotecas ou frameworks externos. Para utilizá-la:

Clone ou baixe este repositório.
Abra o arquivo index.html em qualquer navegador de internet moderno (Google Chrome, Firefox, etc.).
Pronto! A interface de visualização já estará pronta para uso.
## Funcionalidades Implementadas

A interface da aplicação é dividida em três painéis principais: Controles, Visualização (Diretório e Cestos) e Logs.

Inicialização/Reset: Permite ao usuário definir a capacidade máxima de elementos que cada bucket (cesto) pode armazenar e (re)iniciar a estrutura a qualquer momento.

Inserção de Elementos: Ao inserir um valor inteiro, a aplicação calcula o hash, localiza o cesto correspondente e insere o elemento. O painel de logs descreve cada passo do processo. Caso o cesto esteja cheio, a aplicação realiza automaticamente:

Divisão do Cesto (Split): O cesto cheio é dividido em dois, e seus elementos são redistribuídos.

Duplicação do Diretório: Se a profundidade local do cesto que precisa ser dividido for igual à profundidade global, o diretório de ponteiros é duplicado para permitir o endereçamento dos novos cestos.

Busca de Elementos: Permite verificar a presença de uma chave na tabela. A interface destaca a entrada no diretório e o cesto onde a busca foi realizada, informando no log se a chave foi encontrada.

Remoção de Elementos: Exclui uma chave específica da tabela. A operação é registrada no log, e o cesto é atualizado visualmente.

Feedback Visual e Logs: Todas as operações são acompanhadas de feedback visual, com destaque de cores nos cestos e no diretório, além de um relatório detalhado no painel de logs, que explica o porquê de cada ação tomada pela estrutura.
Detalhes da Implementação (JavaScript)
O coração do projeto reside no arquivo hash-extensivel.js. A seguir, um resumo da lógica implementada.

## Estrutura de Dados
Diretório: Representado por um objeto JavaScript que armazena a globalDepth (profundidade global) e um array pointers, que mapeia os resultados da função de hash para os IDs dos cestos.
Cestos (Buckets): Cada cesto é um objeto que contém um id único, sua localDepth (profundidade local), a capacity (capacidade máxima) e um array elements para armazenar as chaves.
Lógica Principal
Função de Hash: A função getHash(key, depth) é a base de tudo. Ela calcula o endereço de uma chave no diretório utilizando o operador módulo sobre a potência de 2 da profundidade (key % 2^depth).

Inserção (insertElement):
Primeiro, o hash da nova chave é calculado usando a profundidade global para encontrar o índice no diretório.
O ponteiro nesse índice nos leva ao cesto de destino.
Se o cesto não estiver cheio, a chave é simplesmente adicionada.
Se o cesto estiver cheio (elements.length >= capacity), a rotina de divisão é acionada.
Se a profundidade local do cesto (localDepth) for igual à profundidade global (globalDepth), o diretório precisa crescer. Sua profundidade é incrementada e o array de ponteiros é duplicado.
Após garantir espaço no diretório, um novo cesto é criado. A profundidade local do cesto antigo e do novo são incrementadas. Os ponteiros do diretório que apontavam para o cesto antigo são reavaliados e alguns passam a apontar para o novo cesto.

Finalmente, todos os elementos do cesto antigo (mais a nova chave que se tentava inserir) são redistribuídos entre o cesto antigo e o novo, de acordo com seus novos hashes baseados na profundidade local atualizada.
Busca e Remoção (searchElement, deleteElement):

Ambas as funções são mais diretas. Elas usam a função de hash com a profundidade global para encontrar o cesto correto e, em seguida, operam no array elements desse cesto para verificar a existência ou remover o elemento, respectivamente.
Checklist de Entrega
