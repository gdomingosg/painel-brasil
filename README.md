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

## Atualizar os dados

Edite o arquivo correspondente em `data/` e faça commit; o GitHub Pages publica a nova versão em alguns minutos.

Versão exportada do painel original em 22/10/2026.
