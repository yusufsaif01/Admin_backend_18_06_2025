const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const config = require("../config");
const MongoHostUrl = require("../config/configs/db.json");
const modelAutoload = require("./model/autoload");
const fs = require("fs");
const path = require("path");
class Connection {
  constructor() {
    this.config = config.db;
  }

  async connectDB() {
    this.dbConnection = await this.connectMongoDB();
    return this.dbConnection;
  }

  disconnectDB() {
    return mongoose.connection.close();
  }

  async connectMongoDB() {
    try {
      const caPath = path.resolve(__dirname, "./certs/global-bundle.pem");
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: false,
        ssl: true,
        sslCA: fs.readFileSync(caPath),
        authSource: "admin",
      };

      //const hostURL = config.db.db_host_dev;
      const hostURL = config.db.db_host_prod;

      this.attachEvents();
      console.log("✅ Connected to AWS DocumentDB");
      return await mongoose.connect(hostURL, options);
    } catch (err) {
      console.error("❌ Error in MongoDB connection:", err);
      throw err;
    }
  }

  attachEvents() {
    let connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("DB Connected");
      modelAutoload(true);
    });

    connection.on("disconnected", (err) => {
      console.log("DB disconnected", err);
    });

    connection.on("close", () => {
      console.log("DB connection close");
    });

    connection.on("reconnected", () => {
      console.log("DB reconnected");
    });

    connection.on("reconnected", () => {
      console.log("DB reconnected");
    });

    connection.on("error", (err) => {
      console.log("DB connection error", err);
    });
  }
}

module.exports = new Connection();
