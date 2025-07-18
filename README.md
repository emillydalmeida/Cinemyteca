# 🎬 Cinemyteca

Uma aplicação Next.js para gerenciar sua coleção pessoal de filmes assistidos, com sincronização híbrida entre armazenamento local (PouchDB) e remoto (Supabase).

## ✨ Funcionalidades

- 📱 **Interface Responsiva**: Design moderno que funciona em qualquer dispositivo
- 🎭 **Categorias por Gênero**: Organize filmes por ação, comédia, drama, terror, etc.
- ⭐ **Sistema de Avaliação**: Adicione notas e comentários pessoais
- 🔄 **Sincronização Híbrida**: Funciona offline com PouchDB e sincroniza com Supabase
- 📊 **Estatísticas**: Veja sua coleção com números e análises
- 🗑️ **Gerenciamento**: Adicione, remova e gerencie duplicatas
- 🔍 **Busca Integrada**: Pesquisa filmes via TMDB API
- 💾 **Backup Local**: Exporte seus dados a qualquer momento

## 🚀 Começando

### Pré-requisitos

- Node.js 14+ 
- npm, yarn, pnpm ou bun

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/emillydalmeida/Cinemyteca.git
cd Cinemyteca
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Arquitetura

### Tecnologias Principais

- **Next.js 15.4.1**: Framework React com SSR/SSG
- **PouchDB 8.0.1**: Banco de dados local no navegador
- **Supabase**: Backend remoto com PostgreSQL
- **TMDB API**: Dados de filmes e posters

### Estrutura de Armazenamento

```
📁 services/
├── ServicoHibrido.js     # Orquestração entre local e remoto
├── PouchDBServico.js     # Gerenciamento local
├── SupabaseServico.js    # Gerenciamento remoto
├── ArmLocalServico.js    # Interface de armazenamento
└── tmdbServico.js        # Integração com TMDB
```

## 🎯 Como Usar

1. **Adicionar Filmes**: Clique no + em qualquer categoria
2. **Buscar**: Digite o nome do filme para encontrar no TMDB
3. **Avaliar**: Adicione notas de 1-10 e comentários pessoais
4. **Organizar**: Filmes são automaticamente categorizados por gênero
5. **Estatísticas**: Veja o botão "Estatísticas" na página inicial
6. **Backup**: Use o botão "Backup" para exportar seus dados

## 🔧 Configuração Avançada

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica
NEXT_PUBLIC_TMDB_API_KEY=sua_chave_tmdb
```

### Banco de Dados Supabase

Execute o script SQL em `sql/setup_supabase.sql` para criar as tabelas necessárias.

## 📱 Recursos Mobile

- Design responsivo otimizado para touch
- Funciona offline com PouchDB
- Progressive Web App (PWA) ready
- Sincronização automática quando online

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 👩‍💻 Desenvolvedora

**Emilly Efanny** - [GitHub](https://github.com/emillydalmeida)

---

Feito com ❤️ para cinéfilos que amam organizar suas coleções!
