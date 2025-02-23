const uuid = require("uuid/v4");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = {
  fields: {
    user_id: {
      type: String,
      required: true,
      default: function () {
        return uuid();
      },
    },
    imageName: {
      type: String,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    position: [
      {
        item_id: {
          type: Number,
        },
        item_text: {
          type: String,
        },
      },
    ],
    image: {
      type: Array, // Array of objects containing `player_user_id` and `status`
      default: [], // Default to an empty array
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
  },

  schemaName: "ads_details",

  options: {
    timestamps: true,
  },
};
