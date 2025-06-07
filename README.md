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

![ChatGPT Image 1 de jun  de 2025, 11_15_36](https://github.com/user-attachments/assets/5f16e5ad-ae27-4d7d-bc6b-92b89980fb2f)




