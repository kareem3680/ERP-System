const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

client.on("connect", () => {
  console.log("🟢 Redis Connected");
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

module.exports = { client, connectRedis };
