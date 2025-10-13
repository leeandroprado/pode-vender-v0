# Guia de Configuração n8n - Fluxo WhatsApp

## Pré-requisitos

1. **Credenciais Supabase no n8n:**
   - URL: `https://tefidquitahjjxpeowzt.supabase.co`
   - Service Role Key: (configurar nas credenciais do n8n)

2. **Verificar usuário super_admin:**
   Execute no SQL Editor do Supabase:
   ```sql
   SELECT user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;
   ```
   Se não retornar nenhum resultado, crie um:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('SEU_USER_ID_AQUI', 'super_admin');
   ```

---

## Configuração dos Nodes

### Node 1: Webhook Trigger

**Tipo:** Webhook
- **HTTP Method:** POST
- **Path:** `/webhook/whatsapp`
- **Authentication:** None

**Teste com este JSON:**
```json
{
  "from": "5515996056461",
  "message": "Oi",
  "messageId": "WHATSAPP_MSG_ID_123",
  "timestamp": 1728494174
}
```

---

### Node 2: Buscar ou Criar Conversa

**Tipo:** Supabase
- **Credential:** Supabase (usar SERVICE_ROLE_KEY)
- **Resource:** Execute a SQL Query
- **Operation:** Execute Query

**SQL Query:**
```sql
WITH user_data AS (
  SELECT user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1
),
existing_conversation AS (
  SELECT id, user_id FROM conversations 
  WHERE whatsapp_phone = '{{ $json.body.from }}'
  LIMIT 1
),
new_conversation AS (
  INSERT INTO conversations (user_id, whatsapp_phone, status, owner_conversation)
  SELECT user_id, '{{ $json.body.from }}', 'open', 'ia'
  FROM user_data
  WHERE NOT EXISTS (SELECT 1 FROM existing_conversation)
  RETURNING id, user_id
)
SELECT * FROM existing_conversation
UNION ALL
SELECT * FROM new_conversation;
```

**Output esperado:**
```json
[
  {
    "id": "uuid-da-conversa",
    "user_id": "uuid-do-usuario"
  }
]
```

**⚠️ IMPORTANTE:** Este node retorna um array. Use `{{ $json[0].id }}` nos próximos nodes.

---

### Node 3: Inserir Mensagem do Cliente

**Tipo:** Supabase
- **Credential:** Supabase (usar SERVICE_ROLE_KEY)
- **Resource:** Row
- **Operation:** Create
- **Table:** messages

**Campos (JSON/RAW):**
```json
{
  "conversation_id": "{{ $node['Buscar ou Criar Conversa'].json[0].id }}",
  "sender_type": "client",
  "sender_id": "{{ $json.body.from }}",
  "content": "{{ $json.body.message }}",
  "message_type": "text",
  "whatsapp_message_id": "{{ $json.body.messageId }}"
}
```

---

### Node 4: Processar com IA (Exemplo OpenAI)

**Tipo:** HTTP Request
- **Method:** POST
- **URL:** `https://api.openai.com/v1/chat/completions`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_OPENAI_API_KEY`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Você é um assistente de vendas. Responda de forma amigável e profissional."
    },
    {
      "role": "user",
      "content": "{{ $json.body.message }}"
    }
  ]
}
```

**Output esperado:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Olá! Como posso ajudar você hoje?"
      }
    }
  ]
}
```

---

### Node 5: Inserir Resposta da IA

**Tipo:** Supabase
- **Credential:** Supabase (usar SERVICE_ROLE_KEY)
- **Resource:** Row
- **Operation:** Create
- **Table:** messages

**Campos (JSON/RAW):**
```json
{
  "conversation_id": "{{ $node['Buscar ou Criar Conversa'].json[0].id }}",
  "sender_type": "ai",
  "sender_id": "ai_bot",
  "content": "{{ $node['Processar com IA'].json.choices[0].message.content }}",
  "message_type": "text"
}
```

---

### Node 6: Enviar Resposta via WhatsApp

**Tipo:** HTTP Request
- **Method:** POST
- **URL:** `SEU_ENDPOINT_APIZAP/send`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_APIZAP_TOKEN`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "phone": "{{ $json.body.from }}",
  "message": "{{ $node['Processar com IA'].json.choices[0].message.content }}"
}
```

---

## Fluxo Visual

```
┌─────────────────────┐
│  Webhook ApiZap     │
│  (recebe mensagem)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Buscar ou Criar     │
│ Conversa (SQL)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Inserir Mensagem    │
│ Cliente             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Processar com IA    │
│ (OpenAI/Gemini)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Inserir Resposta    │
│ da IA               │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Enviar WhatsApp     │
│ (ApiZap)            │
└─────────────────────┘
```

---

## Troubleshooting

### Erro: "null value in column conversation_id"
- Verifique se o Node 2 está retornando `id` corretamente
- Confirme que está usando `{{ $node['Buscar ou Criar Conversa'].json[0].id }}`
- Execute o SQL manualmente no Supabase para testar

### Erro: "permission denied"
- Verifique se está usando `SUPABASE_SERVICE_ROLE_KEY` e não a anon key
- Confirme que as credenciais estão corretas no n8n

### Erro: "user_id cannot be null"
- Execute a query de verificação do super_admin (veja Pré-requisitos)
- Certifique-se de ter pelo menos 1 usuário com role 'super_admin'

---

## Testando o Fluxo Completo

1. **Ative o Workflow no n8n**
2. **Envie uma requisição de teste:**
   ```bash
   curl -X POST http://seu-n8n.com/webhook/whatsapp \
     -H "Content-Type: application/json" \
     -d '{
       "from": "5515996056461",
       "message": "Teste de integração",
       "messageId": "TEST_001",
       "timestamp": 1728494174
     }'
   ```

3. **Verifique no Supabase:**
   ```sql
   -- Ver conversa criada
   SELECT * FROM conversations WHERE whatsapp_phone = '5515996056461';
   
   -- Ver mensagens
   SELECT * FROM messages WHERE sender_id = '5515996056461' ORDER BY timestamp DESC;
   ```

---

## Próximos Passos

Após o fluxo básico funcionar:
1. Adicionar tratamento de erros
2. Implementar lógica de carrinho (adicionar produtos)
3. Criar fluxo de finalização de pedido
4. Integrar com sistema de pagamento

---

## Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação n8n](https://docs.n8n.io/)
- SQL Editor Supabase: https://supabase.com/dashboard/project/tefidquitahjjxpeowzt/sql/new
