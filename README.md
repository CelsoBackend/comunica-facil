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

### Install dependencies

```bash
yarn install
```

### Mobile

```bash
yarn mobile
```

Scan the QR code with the Expo Go app or run on an emulator.

## Available Scripts (root)

| Script | Description |
|---|---|
| `yarn start` | Start Expo dev server |
| `yarn test` | Run tests in all packages |
