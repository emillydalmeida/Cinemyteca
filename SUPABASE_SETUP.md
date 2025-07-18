# 🌐 Configurando Sincronização em Nuvem com Supabase

A Cinemyteca agora suporta sincronização em nuvem! Todos os usuários que acessarem sua aplicação compartilharão a mesma base de filmes.

## 🚀 Como configurar:

### 1. Criar conta no Supabase (GRATUITO)
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub/Google
4. Crie um novo projeto

### 2. Configurar o banco de dados
1. No painel do Supabase, vá em **SQL Editor**
2. Copie e cole o conteúdo do arquivo `sql/setup_supabase.sql`
3. Clique em **Run** para executar

### 3. Obter as credenciais
1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** (algo como: https://abc123.supabase.co)
   - **Anon public key** (uma string longa)

### 4. Configurar no Vercel
1. Acesse o painel do Vercel
2. Vá em **Project Settings** > **Environment Variables**
3. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoaqui.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```
4. Faça um novo deploy (ou aguarde o automático)

### 5. Configurar localmente (opcional)
Crie/atualize o arquivo `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoaqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## ✨ Como funciona:

### Modo Híbrido (com Supabase configurado):
- 🌐 **Dados sincronizados**: Todos os usuários veem os mesmos filmes
- 💾 **Backup local**: Dados também salvos no navegador (offline-first)
- 🔄 **Sincronização automática**: Novos filmes aparecem para todos

### Modo Local (sem Supabase):
- 💾 **Apenas local**: Dados ficam só no seu navegador
- 📱 **Por dispositivo**: Cada navegador tem sua própria lista
- 💪 **Sempre funciona**: Não depende de internet

## 🎯 Status da sincronização:

Olhe no canto inferior direito da tela:
- 🌐 **Sincronizado**: Modo híbrido ativo
- 💾 **Apenas Local**: Modo local ativo
- ⏳ **Carregando**: Inicializando

## 🔧 Troubleshooting:

**"Apenas Local" mesmo com Supabase configurado?**
- Verifique se as variáveis de ambiente estão corretas
- Confirme que a tabela foi criada (execute o SQL novamente)
- Veja o console do navegador para erros

**Filmes não aparecem para outros usuários?**
- Aguarde alguns segundos (sincronização em andamento)
- Recarregue a página
- Verifique se ambos estão usando a mesma URL do Vercel

## 🎉 Pronto!

Agora sua Cinemyteca é compartilhada entre todos os usuários! 

Cada filme adicionado por qualquer pessoa será visível para todos que acessarem sua aplicação.
