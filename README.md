# Presidentes e Indicadores do Brasil

Painel interativo sobre os presidentes do Brasil desde 1889 (classificação esquerda/direita) e indicadores de renda, fome, educação, segurança e mortalidade infantil, além de mapa por estado, eleição de 2026 (Flávio x Lula), checagem de falas, consciência de classe e voto, feminicídio e armas, e a comparação entre os governos Bolsonaro e Lula. Todas as linhas de dados trazem fonte e link.

**Acesse:** https://gdomingosg.github.io/painel-brasil/

Para abrir direto numa aba, acrescente `#` e o nome dela ao endereço:
`#presidentes`, `#duelo`, `#checagem`, `#indicadores`, `#mapa`, `#classe`, `#feminicidio`, `#governos`, `#temas`, `#metodo`.

## Como está organizado

| Caminho | O que é |
|---|---|
| `index.html` | A página do painel (estilo, marcação e scripts dos gráficos) |
| `dash-runtime.js` | Carrega os dados e oferece aos gráficos a mesma interface usada no painel original |
| `data/*.json` | Os 30 conjuntos de dados, um arquivo por fonte |
| `vendor/d3.v7.9.0.min.js` | Biblioteca de gráficos D3 (licença em `vendor/d3-LICENSE.txt`) |

O site é 100% estático: não precisa de servidor, banco de dados nem login. Funciona no celular e no computador, com tema claro/escuro (segue o sistema; botão no canto inferior direito).

## Intenção de voto no 2º turno

Na aba `#duelo`, logo abaixo do resultado do 1º turno, a página consulta `data/pesquisas_2turno.json` toda vez que é aberta (e no botão "Consultar de novo"). A consulta vai primeiro direto ao arquivo no GitHub (`raw.githubusercontent.com`), então uma pesquisa nova aparece assim que o arquivo é atualizado na branch `main`, sem esperar a publicação do Pages; se essa consulta falhar, usa a cópia publicada com o site.

Para incluir uma pesquisa, acrescente um item em `pesquisas` (instituto, datas de campo e divulgação, amostra, margem, registro no TSE, votos válidos de `flavio` e `lula`, fonte e link) e atualize `atualizado_em`. A média exibida é simples: a última pesquisa de cada instituto feita nos 7 dias anteriores à mais recente.

## Contagem de acessos (Google Analytics 4)

O `index.html` traz o código do Google Analytics 4 no fim do `<head>`. Ele só funciona com o ID de medição preenchido em `var GA_ID = "G-..."`; com o campo vazio, nada é carregado. Além das visitas, cada troca de aba gera o evento `abrir_aba` com o parâmetro `aba` (para ver por aba nos relatórios, cadastre `aba` como dimensão personalizada de evento no Analytics).

## Atualizar os dados

Edite o arquivo correspondente em `data/` e faça commit; o GitHub Pages publica a nova versão em alguns minutos.

Versão exportada do painel original em 22/10/2026.
