const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "product description is required"],
      minlength: [20, "To short product description "],
    },
    file: {
      type: String,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null }, // Soft delete timestamp
      },
    ],

    image: [String],
    class: {
      type: mongoose.Schema.ObjectId,
      ref: "Class",
      required: [true, "post must belong to a Class"],
    },
    isDeleted: { type: Boolean, default: false }, // Field to soft-delete the post
  },

  { timestamps: true }
);

PostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "class", // The field to populate
    select: "name", // Only select the 'name' field from the populated category
  });
  next();
});

// Virtual to filter out soft-deleted comments
PostSchema.virtual("activeComments").get(function () {
  return this.comments.filter(comment => !comment.deletedAt); // Filter out deleted comments
});

// Mongoose query middleware
module.exports = mongoose.model("Post", PostSchema);
