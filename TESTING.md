# Testes e Acessibilidade

## Testes Unitários (Vitest)

### Rodar testes

```bash
pnpm test
```

### Rodar com interface gráfica

```bash
pnpm test:ui
```

### Gerar relatório de cobertura

```bash
pnpm test:coverage
```

### Criar novos testes

Crie arquivos `.test.ts` ou `.spec.ts` na pasta `tests/`.

Exemplo:

```typescript
import { describe, it, expect } from "vitest";

describe("Meu componente", () => {
  it("deve funcionar corretamente", () => {
    expect(true).toBe(true);
  });
});
```

---

## Lighthouse CI (Acessibilidade e Performance)

### Rodar auditoria completa

```bash
pnpm lighthouse
```

Isso vai:

1. Fazer o build do projeto
2. Rodar 3 auditorias Lighthouse em cada página
3. Verificar se os scores mínimos são atingidos:
   - Performance: 80%
   - Accessibility: 90%
   - Best Practices: 80%
   - SEO: 80%

### Configuração

Edite `lighthouserc.cjs` para ajustar:

- **Páginas são detectadas automaticamente** de `src/app/`
- Scores mínimos exigidos
- Número de execuções

### Ver relatório detalhado

Após rodar o comando, o Lighthouse CI gera um link público temporário com o relatório completo.

---

## Estrutura de Testes

```
tests/
├── setup.ts           # Configuração global dos testes
└── header.test.ts     # Exemplo de teste do header
```

## Comandos Úteis

- `pnpm test` - Roda todos os testes
- `pnpm test:ui` - Interface gráfica dos testes
- `pnpm test:coverage` - Cobertura de código
- `pnpm lighthouse` - Auditoria de acessibilidade
