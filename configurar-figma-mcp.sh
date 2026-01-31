#!/bin/bash

# Script para configurar o Figma MCP no Cursor
# Uso: ./configurar-figma-mcp.sh SEU-TOKEN-AQUI

if [ -z "$1" ]; then
    echo "❌ Erro: Token do Figma não fornecido"
    echo ""
    echo "Uso: ./configurar-figma-mcp.sh SEU-TOKEN-AQUI"
    echo ""
    echo "Para obter um token:"
    echo "1. Acesse: https://www.figma.com/developers/api#access-tokens"
    echo "2. Crie um token pessoal"
    echo "3. Execute este script com o token"
    exit 1
fi

FIGMA_TOKEN="$1"
CURSOR_CONFIG_DIR="$HOME/Library/Application Support/Cursor/User/globalStorage"

echo "🔧 Configurando Figma MCP para Cursor..."
echo ""

# Verificar se o diretório existe
if [ ! -d "$CURSOR_CONFIG_DIR" ]; then
    echo "⚠️  Diretório de configuração do Cursor não encontrado."
    echo "   Certifique-se de que o Cursor está instalado."
    exit 1
fi

# Procurar arquivo de configuração MCP
MCP_CONFIG_FILE=$(find "$CURSOR_CONFIG_DIR" -name "*mcp*.json" -o -name "*settings*.json" | head -1)

if [ -z "$MCP_CONFIG_FILE" ]; then
    echo "📝 Arquivo de configuração MCP não encontrado."
    echo "   Você precisará adicionar manualmente a configuração."
    echo ""
    echo "Configuração para adicionar:"
    echo ""
    cat <<EOF
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=${FIGMA_TOKEN}", "--stdio"]
    }
  }
}
EOF
    echo ""
    echo "📖 Consulte CONFIGURACAO_FIGMA_MCP.md para mais detalhes"
    exit 0
fi

echo "✅ Arquivo de configuração encontrado: $MCP_CONFIG_FILE"
echo ""
echo "⚠️  Por segurança, este script não modifica automaticamente o arquivo."
echo "   Por favor, adicione manualmente a seguinte configuração:"
echo ""
echo "---"
cat <<EOF
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=${FIGMA_TOKEN}", "--stdio"]
    }
  }
}
EOF
echo "---"
echo ""
echo "📖 Consulte CONFIGURACAO_FIGMA_MCP.md para instruções detalhadas"
