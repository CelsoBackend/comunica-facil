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

## Download e Instalação do APK (.apk)

Você pode baixar e instalar o aplicativo diretamente no seu celular Android sem precisar compilar o código.

- 📥 **Download direto**: [Última Release no GitHub](https://github.com/CelsoBackend/comunica-facil/releases/latest)

### Passo a Passo de Instalação no Celular
1. Baixe o arquivo `comunica-facil.apk` acessando a [Release no GitHub](https://github.com/CelsoBackend/comunica-facil/releases/latest) pelo navegador do celular.
2. Abra o arquivo baixado. Se solicitado, permita a instalação a partir do navegador/gerenciador de arquivos (*Fontes Desconhecidas*).
3. Caso apareça o aviso do **Google Play Protect**, clique em **"Mais detalhes"** e depois em **"Instalar assim mesmo"**.
4. Conclua a instalação e abra o app.

## Publicação e Builds (Android)

### Assets já preparados no repositório

- Ícone da loja (`512x512`): `packages/mobile/assets/play-store/icon-512.png`
- Feature graphic (`1024x500`): `packages/mobile/assets/play-store/feature-graphic-1024x500.png`
- Ícone do app: `packages/mobile/assets/icon.png`
- Adaptive icon:
  - foreground: `packages/mobile/assets/adaptive-icon-foreground.png`
  - background: `packages/mobile/assets/adaptive-icon-background.png`

### Gerar APK ou AAB (EAS Build)

No diretório `packages/mobile`:

- **Gerar `.apk` (para GitHub Releases e instalação direta)**:
  ```bash
  npx eas build --platform android --profile preview
  ```

Após gerar o build:

1. Instalar o artefato em dispositivo/emulador Android.
2. Validar fluxo básico do app (abrir, navegar e acionar um botão de comunicação).
