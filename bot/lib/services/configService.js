import { supabase } from "../infra/supabase.js";

const parseModelName = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") return [parsed];
    return [];
  } catch {
    return [];
  }
};

export async function getBotConfigByInstallation(installationId) {
  const { data, error } = await supabase
    .from("bot_configs")
    .select("model_name")
    .eq("installation_id", installationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return parseModelName(data?.model_name);
}
