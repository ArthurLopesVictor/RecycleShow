// Esse arquivo é tipo um dicionário gigante onde guardamos dados usando chaves e valores
// É uma forma simples de armazenar informações sem precisar criar várias tabelas complexas
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Função que cria o cliente do Supabase
// Pega as credenciais das variáveis de ambiente
const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);


// Guarda um valor no banco usando uma chave
// É tipo fazer: banco["chave"] = valor
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_880f6dab").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};


// Busca um valor no banco pela chave
// É tipo fazer: valor = banco["chave"]
export const get = async (key: string): Promise<any> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_880f6dab").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;  // Retorna só o valor, sem a chave
};


// Remove uma chave e seu valor do banco
// É tipo fazer: delete banco["chave"]
export const del = async (key: string): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_880f6dab").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};


// Guarda vários valores de uma vez (operação em lote)
// Muito mais rápido que fazer um por um
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_880f6dab").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

// Busca vários valores de uma vez
// Retorna um array com os valores na mesma ordem das chaves
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_880f6dab").select("value").in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};


// Remove várias chaves de uma vez (operação em lote)
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_880f6dab").delete().in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

// Busca todas as chaves que começam com determinado texto
// Exemplo: buscar "player:" retorna todos os jogadores
// Muito útil pra pegar dados relacionados de uma vez só
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_880f6dab").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];  // Retorna só os valores, sem as chaves
};