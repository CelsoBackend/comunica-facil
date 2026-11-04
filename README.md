# Comunica Fácil

Monorepo com app mobile React Native (Expo), focado em comunicação assistiva offline.

## Structure

```
comunica-facil/
├── packages/
│   └── mobile/    # React Native (Expo) app
└── package.json   # Yarn workspaces root
```

## Prerequisites

- Node.js >= 18
- Yarn 1.x
- Expo CLI (`npm install -g expo-cli`)

## Getting Started

## Instalar dependencias

## Instalar o yarn 

## Windows
### com o node.js instalado
```bash
npm install --global yarn
```

## Ubuntu
### 1. Adicione a chave GPG do repositório
```bash
curl -sS https://yarnpkg.com | sudo apt-key add -
```

### 2. Adicione o repositório ao seu sistema
```bash
echo "deb https://yarnpkg.com stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```

### 3. Atualize a lista de pacotes e instale o Yarn
```bash
sudo apt update && sudo apt install yarn
```

## MacOS
```bash
brew install yarn
```
## Verificação
```bash
yarn --version
```

## Baixar o app Expo Go na loja de aplicativos Google Play no seu Celular(android)
https://play.google.com/store/apps/details?id=host.exp.exponent&hl=pt_BR&pli=1

## Instalar dependencias
```bash
yarn install
```

## Iniciar o projeto
```bash
yarn start
```

## Em caso de algum erro referente as versões do expo CLI 
```bash
npx expo install expo@^58.0.0 --fix
```

## Celular
- Entre no Expo Go
- Clique no botão Scan QR
- Aponte para o QR Code que esta aparecendo no terminal.

Obs: o Celular precisa estar na mesma rede Wifi do computador.

## Scripts disponiveis (root)

| Script | Description |
|---|---|
| `yarn start` | Start Expo dev server |
| `yarn test` | Run tests in all packages |
