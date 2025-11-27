export type SerializableChatMessage = {
  sender: string; // "user" | "agent" | "ai" | "system_summary" ...
  text: string;
};
