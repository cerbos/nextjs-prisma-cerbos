import { GRPC } from "@cerbos/grpc";

let cerbos: GRPC | undefined;

export function getCerbosClient(): GRPC {
  if (!cerbos) {
    const url = process.env.CERBOS_URL;
    let playgroundInstance = process.env.CERBOS_PLAYGROUND_INSTANCE;

    if (url) {
      if (url === "demo-pdp.cerbos.cloud" && !playgroundInstance) {
        playgroundInstance = "urL7ZEEA63d943b1SULSYmYsRSpiuvX8";
      }

      cerbos = new GRPC(url, {
        tls: true,
        playgroundInstance,
      });
    } else {
      cerbos = new GRPC("localhost:3593", { tls: false });
    }
  }

  return cerbos;
}
