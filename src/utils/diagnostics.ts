// Diagnóstico de Conexão com Supabase
import { supabase } from "@/integrations/supabase/client";

export async function runDiagnostics() {
  console.log("🔍 Iniciando diagnóstico do Supabase...\n");

  // 1. Verificar autenticação
  console.log("1️⃣ Verificando autenticação...");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error("❌ Erro de autenticação:", authError);
    return { success: false, error: "Erro de autenticação" };
  }
  
  if (!user) {
    console.error("❌ Usuário não autenticado");
    return { success: false, error: "Usuário não autenticado" };
  }
  
  console.log("✅ Usuário autenticado:", user.email);
  console.log("   User ID:", user.id);

  // 2. Testar conexão com conversas
  console.log("\n2️⃣ Testando busca de conversas...");
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .limit(5);

  if (convError) {
    console.error("❌ Erro ao buscar conversas:", convError);
    return { success: false, error: convError.message };
  }

  console.log(`✅ Conversas encontradas: ${conversations?.length || 0}`);
  if (conversations && conversations.length > 0) {
    console.log("   Primeira conversa:", {
      id: conversations[0].id,
      phone: conversations[0].whatsapp_phone,
      status: conversations[0].status,
    });
  }

  // 3. Testar busca de mensagens
  console.log("\n3️⃣ Testando busca de mensagens...");
  if (conversations && conversations.length > 0) {
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversations[0].id)
      .limit(5);

    if (msgError) {
      console.error("❌ Erro ao buscar mensagens:", msgError);
    } else {
      console.log(`✅ Mensagens encontradas: ${messages?.length || 0}`);
    }
  }

  // 4. Verificar novas tabelas
  console.log("\n4️⃣ Verificando novas tabelas...");
  
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('count')
    .limit(1);
  
  if (mediaError) {
    console.error("❌ Tabela 'media' não acessível:", mediaError.message);
  } else {
    console.log("✅ Tabela 'media' acessível");
  }

  const { data: links, error: linksError } = await supabase
    .from('conversation_links')
    .select('count')
    .limit(1);
  
  if (linksError) {
    console.error("❌ Tabela 'conversation_links' não acessível:", linksError.message);
  } else {
    console.log("✅ Tabela 'conversation_links' acessível");
  }

  // 5. Verificar realtime
  console.log("\n5️⃣ Verificando realtime...");
  const channel = supabase.channel('test-channel');
  const status = channel.state;
  console.log("   Status do canal:", status);

  console.log("\n✅ Diagnóstico concluído!");
  return { 
    success: true, 
    user: user.email,
    conversationsCount: conversations?.length || 0 
  };
}
