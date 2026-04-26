const http = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({
  dev,
  dir: __dirname,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((request, response) => handle(request, response));

    server.listen(port, hostname, () => {
      console.log(`Frontend server is running at http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start frontend server:", error);
    process.exit(1);
  });
