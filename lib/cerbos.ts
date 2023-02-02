import { GRPC } from "@cerbos/grpc";

export function getCerbosClient() {
  const url = process.env.CERBOS_URL;
  let playgroundInstance = process.env.CERBOS_PLAYGROUND_INSTANCE;

  if (url) {
    if (url === "demo-pdp.cerbos.cloud" && !playgroundInstance) {
      // Default to the public PDP instance ID if targeting that URL
      playgroundInstance = "urL7ZEEA63d943b1SULSYmYsRSpiuvX8"
    }

    return new GRPC(url, {
      tls: true,
      playgroundInstance: playgroundInstance,
    });
  }

  // Otherwise look for a locally running instance
  return new GRPC("localhost:3593", { tls: false });
}
