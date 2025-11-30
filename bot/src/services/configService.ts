import { supabase } from "../infra/supabase.js";

type BotConfig = { model_name: string[] | string | null };

export async function getBotConfigByInstallation(installationId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("bot_configs")
    .select("model_name")
    .eq("installation_id", installationId)
    .maybeSingle<BotConfig>();

  if (error) {
    throw error;
  }

  if (!data?.model_name) return [];

  if (Array.isArray(data.model_name)) return data.model_name;
  try {
    return JSON.parse(data.model_name as string);
  } catch {
    return [];
  }
}
