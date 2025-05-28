const mongoose = require("mongoose");

mongoose.plugin((schema) => {
  const hostUrl = process.env.HOST_URL || "";

  const appendHost = (doc) => {
    if (!doc) return;

    const hostUrl = process.env.HOST_URL || "";

    if (typeof doc.image === "string" && !doc.image.startsWith("http")) {
      doc.image = hostUrl + doc.image;
    }

    if (Array.isArray(doc.images)) {
      doc.images = doc.images
        .filter((img) => typeof img === "string")
        .map((img) => (img.startsWith("http") ? img : hostUrl + img));
    }
  };

schema.post("find", function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach(appendHost);
  }
});
  schema.post("findOne", appendHost);
  schema.post("findOneAndUpdate", appendHost);
});

const dbconnection = async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log(`✅ DB connected to ${mongoose.connection.host}`);
};

module.exports = dbconnection;
