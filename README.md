# MeGuia App 🗺️

Aplicativo de planejamento de viagens com roteiros inteligentes

## 🚀 Começando

```bash
# Instalação
npm install

# iOS (Mac apenas)
npx pod-install
npm run ios

# Android
npm run android

# Desenvolvimento
expo start

## ♿ Acessibilidade

### Implementado
- [x] `accessible={true}` em todos os botões
- [x] `accessibilityLabel` para elementos interativos
- [x] Contraste mínimo de 4.5:1 para texto
- [x] Suporte a Dynamic Type (iOS)

### Exemplo de Código
```jsx
<TouchableOpacity
  accessible
  accessibilityLabel="Botão para salvar roteiro"
  accessibilityHint="Toque duas vezes para salvar o roteiro atual"
>
  <Text>Salvar</Text>
</TouchableOpacity>