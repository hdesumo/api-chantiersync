const { validationResult } = require("express-validator");
const License = require("../models/License");

exports.getAll = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtrage (status, type, enterprise_id)
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.type) where.type = req.query.type;
    if (req.query.enterprise_id) where.enterprise_id = req.query.enterprise_id;

    const { rows, count } = await License.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    return res.json({
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: rows
    });
  } catch (err) {
    console.error("Erreur SQL getAll:", err);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

