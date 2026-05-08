# Arquitetura CSS - Catálogo de Práticas

## 📋 Descrição

O CSS foi separado em **3 arquivos distintos** para facilitar a manutenção e personalização independente da página principal e do catálogo gerado.

---

## 📁 Estrutura de Arquivos

### 1. **shared.css** (Compartilhado)
- **Localização:** `./shared.css`
- **Propósito:** Contém estilos e variáveis compartilhados entre a página principal e o catálogo gerado
- **Conteúdo:**
  - Variáveis CSS (`:root`) - cores, dimensões, espaçamento
  - Reset global (`* { box-sizing: border-box }`)
  - Estilos de `body`
  - Estilos da faixa lateral (`.faixa-esquerda`)
- **Usado por:**
  - `index.html` (página principal)
  - Catálogo gerado (injetado via `gerador.js`)

### 2. **index.css** (Página Principal)
- **Localização:** `./index.css`
- **Propósito:** Estilos exclusivos da interface do gerador (index.html)
- **Conteúdo:**
  - Layout da página (`.app.centered`, `.card`, `.hero`)
  - Estilos de controles (`.controls`, `.control`, `.cover-field`)
  - Estilos de botões (`.btn`, `.btn.primary`, `.btn.large`)
  - Animações de campos de cobertura
  - Responsividade mobile
- **Modificações:** Edite este arquivo para personalizar a aparência da página principal SEM afetar o catálogo gerado

### 3. **catalog.css** (Catálogo Gerado)
- **Localização:** `./catalog.css`
- **Propósito:** Estilos exclusivos do catálogo gerado
- **Conteúdo:**
  - Layout do catálogo (`.wrap`, `.header-bar`)
  - Estilos de tabelas
  - Estilos de pills (badges "Novo")
  - Estilos de capa (`.cover-page`)
  - Estilos de impressão (`@media print`)
- **Injeção:** Carregado automaticamente via `gerador.js` (função `ensureCatalogCSS()`)
- **Modificações:** Edite este arquivo para personalizar o design do catálogo gerado SEM afetar a página principal

### 4. **templates/templates.css** (Templates Legacy)
- **Localização:** `./templates/templates.css`
- **Propósito:** Estilos dos templates e componentes específicos
- **Conteúdo:**
  - Definições de fontes (Gilroy)
  - Estilos de página (`.page`, `.page-wrapper`)
  - Estilos de templates (capa, contracapa, catálogo integrado)
  - Estilos de cobertura unificada (`.cover-page`)
- **Nota:** Alguns estilos de `.cover-page` são duplicados em `catalog.css` para manutenção futura

---

## 🔗 Fluxo de Carregamento

### Na página principal (index.html):
```
index.html
  ├── shared.css (variáveis, reset, body)
  └── index.css (layout, controles, botões)
```

### No catálogo gerado:
```
gerador.js (renderCatalog)
  ├── ensureTemplatesCSS() → templates/templates.css
  ├── ensureCatalogCSS()   → catalog.css
  └── shared.css (já carregado pela página principal)
```

---

## 🎨 Customização

### Para personalizar a página principal:
1. Edite `index.css`
2. Exemplo: alterar cores dos botões, layout dos controles, etc.
3. **Nenhum efeito** no catálogo gerado

### Para personalizar o catálogo gerado:
1. Edite `catalog.css`
2. Exemplo: alterar cores das tabelas, tamanho de fontes, espaçamento, etc.
3. **Nenhum efeito** na página principal

### Para alterar cores globais (ambas as páginas):
1. Edite as variáveis CSS em `shared.css` (seção `:root`)
2. Exemplo: `--red-main`, `--red-mid`, `--text-strong`, etc.

---

## 📝 Histórico

- **Antes:** Um único arquivo `style.css` continha todos os estilos
- **Depois:** Separados em 3 arquivos para melhor manutenibilidade
- **Benefício:** Permite customização independente sem efeitos colaterais

---

## 🛠️ Notas Técnicas

- Os estilos de `shared.css` são injetados primeiro via `index.html`
- Os estilos de `catalog.css` e `templates/templates.css` são injetados dinamicamente via JavaScript
- A ordem de carregamento garante que `shared.css` seja sempre aplicado primeiro
- Especificidade CSS é respeitada (arquivos específicos podem sobrescrever o compartilhado)

---

## ⚠️ Arquivo Legado

O arquivo original `style.css` foi **removido**. Todos os estilos foram migrados para os novos arquivos.
