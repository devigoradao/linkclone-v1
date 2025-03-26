# LinkShare - Compartilhamento de Links

Uma aplicação web para criar e compartilhar uma lista personalizada de links, similar ao Linktree.

## Funcionalidades

- Autenticação de usuários
- Criação e gerenciamento de links
- Página pública personalizada
- Analytics de cliques
- Interface responsiva e moderna
- Integração com Supabase para backend

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Autenticação e Banco de Dados)
- React Hot Toast (Notificações)

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Crie um projeto no [Supabase](https://supabase.com)

4. Configure as variáveis de ambiente:
- Copie o arquivo `.env.local.example` para `.env.local`
- Preencha as variáveis com suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

5. Execute as queries SQL do arquivo `supabase/schema.sql` no SQL Editor do seu projeto Supabase

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
  app/                    # Rotas da aplicação
    (auth)/              # Rotas protegidas
      dashboard/         # Painel do usuário
    [username]/         # Página pública do usuário
    page.tsx            # Página inicial
  components/           # Componentes React
  lib/                  # Utilitários e configurações
  types/               # Tipos TypeScript
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT 