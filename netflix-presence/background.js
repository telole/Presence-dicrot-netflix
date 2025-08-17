let ws;
const WS_URL = "ws://127.0.0.1:5678";

function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => console.log("[Presence] Bridge connected");
  ws.onclose = () => {
    console.log("[Presence] Bridge disconnected. Reconnecting…");
    setTimeout(connect, 2000);
  };
  ws.onerror = () => ws.close();
}

connect();

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.type === "NF_STATUS" && ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg.payload));
  }
});
