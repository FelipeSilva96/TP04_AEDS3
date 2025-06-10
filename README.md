# TP04 - Visualizador de Tabela Hash Extensível

## Participantes:

#### Felipe Pereira da Silva

#### Rikerson Antonio Freitas Silva

#### Maria Eduarda Pinto Martins

#### Kauan Gabriel Silva Pereira


## Visão Geral do Projeto
Este repositório contém o desenvolvimento de um trabalho prático para a disciplina de Algoritmos e Estruturas de Dados III. O projeto consiste em uma aplicação web interativa que demonstra o funcionamento de uma Tabela Hash Extensível, uma estrutura de dados dinâmica que cresce e encolhe de acordo com a necessidade de armazenamento, sendo uma excelente alternativa para manipulação de grandes volumes de dados em disco.

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

### Métodos Principais (Operações)
As funções que operam no diretório são:

Localizar um cesto (getHash): A função getHash(key, depth) é o método principal para usar o diretório. Ela calcula um índice no array pointers com base nos globalDepth bits menos significativos da chave, determinando para qual cesto a chave deve ir.

Duplicar o diretório: Quando um cesto precisa ser dividido, mas sua profundidade local já é igual à profundidade global, o diretório precisa crescer. Essa lógica, presente em insertElement(), faz o seguinte:
Incrementa a globalDepth.
Dobra o tamanho do array pointers, copiando os ponteiros existentes para a nova metade, efetivamente duplicando as referências.
Atualiza os ponteiros que apontavam para o cesto antigo para que alguns deles agora apontem para o novo cesto criado na divisão.

initializeHashTable(): Funciona como o "construtor" da aplicação. Ele reseta a profundidade global para 0, cria o primeiro cesto e configura o diretório inicial para apontar para este cesto.

insertElement(): É o método central para a operação de inserção. Ele encapsula a lógica de:

Calcular o hash da chave para encontrar a entrada no diretório.

Localizar o cesto alvo.

Verificar se o cesto está cheio.

Se não estiver cheio, insere.

Se estiver cheio, aciona a lógica de divisão de cesto e, se necessário, a duplicação do diretório, para só então inserir o elemento.

searchElement(): Implementa a busca. Apenas calcula o hash, encontra o cesto e verifica se o elemento existe no array elements do cesto.

deleteElement(): Implementa a remoção. Semelhante à busca, localiza o cesto e remove o elemento do array elements se ele for encontrado.

## Checklist de Entrega

#### O trabalho implementa corretamente a estrutura de dados Tabela Hash Extensível, incluindo inserção, busca e remoção? Sim
#### A lógica de divisão de cestos (split) foi implementada?	Sim
#### A aplicação possui uma interface gráfica clara e intuitiva para interação do usuário?	Sim
#### A interface exibe visualmente o estado do diretório, a profundidade global, os cestos e a profundidade local?	Sim
#### Existe um painel de logs ou uma área de texto que descreve as operações passo a passo? Sim	
#### O código-fonte está organizado e comentado, facilitando o entendimento?	Sim
#### O trabalho é autocontido e não requer a instalação de dependências externas para ser executado?	Sim

## Relatório de Experiência do Grupo

Para nós, o desenvolvimento deste trabalho prático foi uma experiência muito valiosa e desafiadora. Conseguimos aplicar na prática os conceitos teóricos da Tabela Hash Extensível, o que solidificou nosso aprendizado.

Implementação dos Requisitos: Sim, acreditamos ter implementado todos os requisitos essenciais da estrutura. A aplicação permite inicializar a tabela, inserir, buscar e deletar chaves. O sistema realiza corretamente a divisão de cestos e a duplicação do diretório quando necessário.

Operação Mais Difícil: Sem dúvida, a operação mais complexa de implementar foi a de inserção (insertElement). A dificuldade não estava em simplesmente adicionar um elemento, mas em gerenciar a situação de overflow do cesto.

Desafios Enfrentados: O nosso maior desafio foi a lógica de redistribuição dos elementos após a divisão de um cesto (split), especialmente quando essa divisão também exigia a duplicação do diretório. Garantir que todos os ponteiros no diretório fossem atualizados corretamente e que cada elemento fosse para seu novo cesto exigiu bastante atenção aos detalhes e depuração do código.

Resultados Alcançados: Sim, os resultados foram totalmente alcançados. Ao final, temos uma ferramenta visual funcional que demonstra de forma clara e passo a passo cada operação na Tabela Hash Extensível, cumprindo o objetivo principal do trabalho. Ver o algoritmo funcionando de forma interativa foi o ponto alto do desenvolvimento.
