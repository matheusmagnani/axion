# Configuração do Figma MCP para Cursor

Este guia explica como configurar o servidor MCP do Figma no Cursor para ter acesso aos dados de design do Figma.

## Pré-requisitos

1. **Token de API do Figma**: Você precisa criar um token de acesso pessoal no Figma
   - Acesse: https://www.figma.com/developers/api#access-tokens
   - Crie um token pessoal (apenas leitura é necessária)

## Passo 1: Obter o Token do Figma

1. Acesse https://www.figma.com/developers/api#access-tokens
2. Faça login na sua conta do Figma
3. Clique em "Create a new personal access token"
4. Dê um nome ao token (ex: "Cursor MCP")
5. Copie o token gerado (você só poderá vê-lo uma vez!)

## Passo 2: Configurar no Cursor

### Opção A: Configuração via arquivo de configuração do Cursor

No macOS, o arquivo de configuração do Cursor geralmente está em:
```
~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

Ou você pode acessar através do Cursor:
1. Abra o Cursor
2. Pressione `Cmd + Shift + P` (ou `Ctrl + Shift + P` no Windows/Linux)
3. Digite "Preferences: Open User Settings (JSON)"
4. Adicione a configuração MCP

### Configuração para macOS/Linux:

Adicione o seguinte JSON ao arquivo de configuração MCP do Cursor:

```json
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=SEU-TOKEN-AQUI", "--stdio"]
    }
  }
}
```

### Configuração para Windows:

```json
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=SEU-TOKEN-AQUI", "--stdio"]
    }
  }
}
```

### Opção B: Usar variável de ambiente

Você também pode configurar usando variáveis de ambiente:

```json
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "SEU-TOKEN-AQUI"
      }
    }
  }
}
```

## Passo 3: Reiniciar o Cursor

Após adicionar a configuração:
1. Salve o arquivo de configuração
2. Reinicie o Cursor completamente
3. O servidor MCP será carregado automaticamente

## Como Usar

1. Abra o chat do Cursor (modo agent)
2. Cole um link do Figma (arquivo, frame ou grupo)
3. Peça ao Cursor para implementar o design ou fazer algo com o arquivo do Figma
4. O Cursor buscará automaticamente os metadados relevantes do Figma

## Exemplo de Uso

```
Cole este link do Figma: https://www.figma.com/file/xxxxx/meu-design
Implemente este design em React usando Tailwind CSS
```

## Verificação

Para verificar se está funcionando:
1. Abra o Cursor
2. Verifique se há mensagens de erro no console
3. Tente colar um link do Figma e fazer uma pergunta

## Troubleshooting

- **Erro de autenticação**: Verifique se o token está correto
- **Servidor não inicia**: Verifique se o Node.js está instalado (`node --version`)
- **Timeout**: Verifique sua conexão com a internet

## Referências

- Repositório: https://github.com/GLips/Figma-Context-MCP
- Documentação do Figma API: https://www.figma.com/developers/api
- Site do Framelink: https://www.framelink.ai/
