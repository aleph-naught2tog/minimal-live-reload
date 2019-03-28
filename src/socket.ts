document.addEventListener('DOMContentLoaded', () => {
  const PORT = 3333;

  const socket = new WebSocket(`ws://localhost:${PORT}`);

  socket.onmessage = ({ data }) => {
    const { shouldReload } = JSON.parse(data);
    if (shouldReload) {
      location.reload();
    }
  };

  document.addEventListener('beforeunload', () => {
    socket.close();
  });
});
