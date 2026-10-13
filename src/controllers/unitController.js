import Unit from '../models/Unit.js';
import { logActivity } from '../middleware/activityLogger.js';

export const getUnits = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const units = await Unit.find(query).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (err) {
    next(err);
  }
};

export const createUnit = async (req, res, next) => {
  try {
    const { name, symbol, description, status, isActive } = req.body;
    if (!name || !symbol) {
      return res.status(400).json({
        success: false,
        message: 'Unit name and symbol are required.',
      });
    }

    const cleanSymbol = symbol.toLowerCase().trim();
    const existing = await Unit.findOne({ symbol: cleanSymbol });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Unit symbol '${cleanSymbol}' already exists.`,
      });
    }

    const unit = await Unit.create({
      name: name.trim(),
      symbol: cleanSymbol,
      description: description ? description.trim() : '',
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logActivity(req, {
      action: 'UNIT_CREATED',
      resourceType: 'Unit',
      resourceId: unit._id,
      payload: { name: unit.name, symbol: unit.symbol },
    });

    return res.status(201).json({
      success: true,
      message: 'Measurement unit created successfully',
      data: unit,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, symbol, description, status, isActive } = req.body;

    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found',
      });
    }

    if (symbol && symbol.toLowerCase().trim() !== unit.symbol) {
      const cleanSymbol = symbol.toLowerCase().trim();
      const existing = await Unit.findOne({ symbol: cleanSymbol, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Unit symbol '${cleanSymbol}' is already in use.`,
        });
      }
      unit.symbol = cleanSymbol;
    }

    if (name) unit.name = name.trim();
    if (description !== undefined) unit.description = description.trim();
    if (isActive !== undefined) {
      unit.isActive = Boolean(isActive);
      unit.status = unit.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      unit.status = status.toUpperCase();
      unit.isActive = unit.status === 'ACTIVE';
    }

    await unit.save();

    await logActivity(req, {
      action: 'UNIT_UPDATED',
      resourceType: 'Unit',
      resourceId: unit._id,
      payload: { name: unit.name, symbol: unit.symbol, status: unit.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Unit updated successfully',
      data: unit,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found',
      });
    }

    await logActivity(req, {
      action: 'UNIT_DELETED',
      resourceType: 'Unit',
      resourceId: id,
      payload: { name: unit.name, symbol: unit.symbol },
    });

    return res.status(200).json({
      success: true,
      message: 'Measurement unit removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getUnits, createUnit, updateUnit, deleteUnit };
