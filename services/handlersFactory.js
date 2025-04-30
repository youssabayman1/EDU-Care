const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const asyncHandler = require("express-async-handler");

// Create One
exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (Model.modelName === "Post" && req.user.role !== "teacher") {
      return next(new ApiError("Only teachers can create posts", 403));
    }
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

// Get One (excluding soft-deleted)
exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find the document that is not soft-deleted
    const document = await Model.findOne({ _id: id, isDeleted: false });

    if (!document) {
      return next(new ApiError(`No document found with ID ${id}`, 404));
    }

    // Convert to plain object to modify safely
    const data = document.toObject();

    // If the model has a `comments` field, filter soft-deleted ones
    if (Array.isArray(data.comments)) {
      data.comments = data.comments.filter((comment) => !comment.deletedAt);
    }

    res.status(200).json({ data });
  });

// Get Many (excluding soft-deleted)
exports.getMany = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = { isDeleted: false };
    if (req.filterObj) {
      filter = { ...req.filterObj, isDeleted: false };
    }

    const documentsCount = await Model.countDocuments(filter);

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCount)
      .search(modelName)
      .filter()
      .limitFields()
      .sort();

    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({
      results: documents.length,
      paginationResult,
      data: documents,
    });
  });

// Update One
exports.updateOne = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const { requireAuthCheck = false, fieldFilterFn = null } = options;

    // Optional authorization check
    if (requireAuthCheck && req.user?._id?.toString() !== req.params.id.toString()) {
      return next(new ApiError("You are not authorized to perform this action", 403));
    }

    // Optional: filter allowed update fields
    const updateData = fieldFilterFn ? fieldFilterFn(req.body) : req.body;

    // Apply soft delete condition if the model supports it
    const filter = { _id: req.params.id };
    if (Model.schema.paths.isDeleted) {
      filter.isDeleted = false;
    }

    const document = await Model.findOneAndUpdate(filter, updateData, {
      new: true,
    });

    if (!document) {
      return next(new ApiError(`No document found for ID ${req.params.id}`, 404));
    }

    res.status(200).json({ data: document });
  });

// Soft Delete One
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!document) {
      return next(new ApiError(`No document found for ID ${id}`, 404));
    }

    return res.status(200).json({
      message: `Item with ID ${id} has been soft deleted.`,
      data: document,
    });
  });

// Restore (Undo Delete)
exports.restoreOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!document) {
      return next(new ApiError(`No deleted document found with ID ${id}`, 404));
    }

    return res.status(200).json({
      message: `Item with ID ${id} has been restored.`,
      data: document,
    });
  });
