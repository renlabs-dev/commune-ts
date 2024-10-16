import axios from "axios";

const webhookUrl =
  "https://discord.com/api/webhooks/1296153912126214204/Vs7WKkAs4xyjkou7LV0moKEOlow6YgHEwZ2mvWvLT6lp9gNw3pRivXAvqTnDpWrztNNS";

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface Embed {
  title?: string;
  description?: string;
  color?: number;
  fields?: EmbedField[];
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

export interface WebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: Embed[];
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<void> {
  return await axios.post(webhookUrl, payload, {
    headers: { "Content-Type": "application/json" },
  });
}
