const Promise = require("bluebird");

function connectRedis() {
  try {
    const redisClient = Promise.promisifyAll(
      require("redis").createClient({
        url: "redis://127.0.0.1:6380", // Connect through the SSH tunnel
      })
    );

    redisClient.on("connect", function () {
      console.log(`Connected to Redis`);
    });

    redisClient.on("error", function (err) {
      console.log("Redis error: " + err);
    });

    return redisClient;
  } catch (e) {
    console.log(e);
  }
}

module.exports = connectRedis();
