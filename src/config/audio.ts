export const AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/MohammedAlhashimy/audio-files/refs/heads/main";

export function getAudioUrl(path: string) {
  return `${AUDIO_BASE_URL}/${path}`;
}
