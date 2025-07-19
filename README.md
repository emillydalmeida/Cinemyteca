# 🎬 Cinemyteca

Portfólio pessoal de filmes assistidos com sistema de catalogação por gêneros, avaliações e relatórios de dados.

## 🌐 Acesse Online

**[cinemyteca.vercel.app](https://cinemyteca.vercel.app)**

*Portfólio público para visualizar minha coleção de filmes*

## ✨ Funcionalidades

- 📱 **Interface Responsiva**: Visualização otimizada para qualquer dispositivo
- 🎭 **Categorias por Gênero**: Filmes organizados por ação, comédia, drama, terror, etc.
- ⭐ **Sistema de Avaliação**: Notas TMDB + avaliações pessoais
- 📊 **Estatísticas**: Análise da coleção com números e gráficos
- 📋 **Relatórios**: Exportação de dados em formato JSON
- 🔍 **Busca Integrada**: Pesquisa via TMDB API
- 🗑️ **Gerenciamento**: Limpeza de duplicatas e organização

### 🔐 **Acesso Administrativo**
Para usuários com permissões especiais:
- **Estatísticas**: Painel com dados da coleção
- **Relatórios**: Exportar dados completos em JSON
- **Limpar Duplicatas**: Ferramenta de organização automática
- **Logout**: Encerrar sessão administrativa

## 🏗️ Tecnologias

- **Next.js 15.4.1**: Framework React com renderização server-side
- **Supabase**: Banco PostgreSQL + Sistema de autenticação
- **TMDB API**: Base de dados de filmes
- **CSS Modules**: Estilização componentizada
- **Vercel**: Hospedagem e deploy contínuo

## 🎯 Como Usar

### **Visualização Pública**
- Acesse [cinemyteca.vercel.app](https://cinemyteca.vercel.app)
- Navegue pelas categorias de filmes
- Veja avaliações e estatísticas da coleção

### **Administração** (Acesso Restrito)
- Login via Supabase para gerenciar conteúdo
- **Adicionar Filmes**: Busca via TMDB API com notas e comentários
- **Estatísticas**: Visão geral da coleção
- **Relatórios**: Exportação de dados em JSON
- **Organização**: Limpeza automática de duplicatas

## 📊 Recursos

### 🔍 **Sistema de Relatórios**
```json
{
  "data_geracao": "2025-01-18T15:30:00Z",
  "total_filmes": 42,
  "filmes": [
    {
      "titulo": "Inception",
      "genero": "ficcao",
      "nota_tmdb": 8.8,
      "nota_usuario": 9.5,
      "ano": 2010,
      "usuario_responsavel": "admin@example.com"
    }
  ]
}
```

### 📱 **Características**
- Interface responsiva para todos os dispositivos
- Dados salvos automaticamente na nuvem
- Busca integrada com base de dados TMDB
- Sistema de backup e segurança

## 📱 Benefícios

- ✅ **Acesso público**: Visualize o portfólio sem necessidade de login
- ✅ **Organização**: Filmes categorizados por gêneros
- ✅ **Avaliações**: Sistema dual com notas TMDB e pessoais
- ✅ **Dados exportáveis**: Relatórios em formato JSON
- ✅ **Interface moderna**: Design responsivo e funcional
- ✅ **Totalmente gratuito**: Hospedado na Vercel

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit as mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 👩‍💻 Desenvolvedora

**Emilly Almeida**
- 🐙 GitHub: [@emillydalmeida](https://github.com/emillydalmeida)

## 📄 Licença

Projeto sob a **Licença MIT**. Veja [LICENSE](LICENSE) para mais detalhes.

---

🎬 **[Acesse o portfólio: cinemyteca.vercel.app](https://cinemyteca.vercel.app)**
