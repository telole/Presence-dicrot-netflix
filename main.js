const WebSocket = require("ws");
const RPC = require("discord-rpc");

const CLIENT_ID = "CLIENT_ID"; // Ganti dengan Client ID Discord Lo HAHAHAHAHAHA

RPC.register(CLIENT_ID);
const rpc = new RPC.Client({ transport: "ipc" });

function toActivity(data) {
  const details = data.title ? `Watching: ${data.title}` : "Netflix";
  const stateParts = [];
  if (data.season && data.episode) stateParts.push(`S${data.season} · E${data.episode}`);
  const state = stateParts.join(" ");

  let timestamps = undefined;
  if (data.duration && data.position && !data.paused) {
    const start = Date.now() - data.position * 1000;
    const end = start + data.duration * 1000;
    timestamps = { start, end };
  }

  return {
    details,
    state: state || undefined,
    largeImageKey: "netflix",
    largeImageText: "Netflix",
    buttons: data.url ? [{ label: "Open Netflix", url: data.url }] : undefined,
    instance: false,
    ...(timestamps ? { startTimestamp: timestamps.start, endTimestamp: timestamps.end } : {})
  };
}

function setPresence(payload) {
  const activity = toActivity(payload);
  rpc.setActivity(activity).catch(() => {});
}

const wss = new WebSocket.Server({ port: 5678 }, () =>
  console.log("WS bridge listening on ws://127.0.0.1:5678")
);

wss.on("connection", ws => {
  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg.toString());
      setPresence(data);
    } catch (e) {
      console.error("Bad message:", e);
    }
  });
});

rpc.on("ready", () => console.log("Discord RPC connected"));
rpc.login({ clientId: CLIENT_ID }).catch(err => {
  console.error("Failed to login RPC:", err);
  process.exit(1);
});
