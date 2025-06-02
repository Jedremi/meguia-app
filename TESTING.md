
### 🧪 **TESTING.md** (Guia de Testes)
```markdown
# Estratégia de Testes Automatizados

## 🧠 Tipos de Testes

| Tipo          | Cobertura Alvo | Ferramentas          | Onde Aplicar                |
|---------------|----------------|----------------------|-----------------------------|
| Unitários     | 80%            | Jest                 | Utils, hooks, cálculos      |
| Componentes   | 60%            | React Testing Library | Componentes isolados        |
| Integração    | 50%            | RTL + Jest           | Telas completas            |
| Snapshots     | 30%            | Jest                 | Componentes complexos      |

## 🚀 Executando Testes

```bash
# Todos os testes
npm test

# Testes com watch mode
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Atualizar snapshots
npm run test:update-snapshots