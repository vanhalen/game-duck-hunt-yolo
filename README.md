# Duck Hunt com Modo God (Machine Learning)

Uma releitura do clássico Duck Hunt em JavaScript, utilizando machine learning para identificar patos na tela e atirar automaticamente.
O foco deste projeto não é apenas o jogo em si, mas a experimentação prática de um hack com o modelo YOLO, modo "God" com IA, que pode ser ativado/desativado durante os testes para comparar jogabilidade manual e assistida.

## 🌐 Acesse a demonstração

[https://duckhunt.rodrigorchagas.com.br](https://duckhunt.rodrigorchagas.com.br)

## ⭐ Arquivos principais

Os pontos centrais da funcionalidade de machine learning estão em:

- `machine-learning/main.js`
- `machine-learning/worker.js`

Em `machine-learning/main.js` acontece a integração com o jogo (HUD, mira e disparo automático).
Em `machine-learning/worker.js` ocorre o processamento de inferência para detectar os alvos e retornar as coordenadas previstas.

## 📁 Estrutura do Projeto

```text
.
├── main.js
├── machine-learning/
├── src/
├── dist/
├── webpack.config.js
└── package.json
```

### Descrição dos diretórios

- `main.js` — Ponto de entrada da aplicação
- `machine-learning/` — Integração do modo God com modelo e worker de inferência
- `src/` — Lógica principal do jogo (stage, personagens, HUD, regras de onda/pontuação)
- `dist/` — Arquivos estáticos e artefatos gerados para execução

---

## 🚀 Como executar o projeto

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie a aplicação

```bash
npm start
```

### 3. Acesse no navegador

```text
http://localhost:8989
```

---

## ✨ Funcionalidades

- Jogo Duck Hunt clássico com HUD, pontuação e progressão por ondas
- Mira e disparo manual como modo padrão
- Integração com inferência em tempo real via Web Worker
- Modo "God" com assistência de IA para detectar patos e automatizar tiros
- Camada de visualização para acompanhar previsões geradas pelo modelo
- Base preparada para experimentos e evolução de estratégias de automação

---

## 🛠 Tecnologias utilizadas

- JavaScript
- HTML5
- PixiJS
- GSAP
- Howler.js
- TensorFlow.js
- Web Worker

---

Se precisar de ajuda ou encontrar problemas, não hesite em abrir uma issue no repositório! 🚀
