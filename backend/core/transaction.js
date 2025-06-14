const { Transaction, User, Category } = require('../models');
const { Op } = require('sequelize');

exports.getBatch = async (req, res) => {
  try {
    const {
      userId,
      type,        // 'income' or 'expense'
      categoryId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      sortBy = 'date',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.date[Op.lte] = new Date(endDate);
      }
    }

    // Get transactions with related data
    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await Transaction.count({
      where: whereClause
    });

    // Calculate summary statistics
    const summaryStats = await Transaction.findAll({
      where: whereClause,
      attributes: [
        'type',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      incomeCount: 0,
      expenseCount: 0,
      netAmount: 0
    };

    summaryStats.forEach(stat => {
      if (stat.type === 'income') {
        summary.totalIncome = parseFloat(stat.total || 0);
        summary.incomeCount = parseInt(stat.count || 0);
      } else if (stat.type === 'expense') {
        summary.totalExpense = parseFloat(stat.total || 0);
        summary.expenseCount = parseInt(stat.count || 0);
      }
    });

    summary.netAmount = summary.totalIncome - summary.totalExpense;

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        },
        summary
      }
    });

  } catch (error) {
    console.error('[ ERROR ] Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch transactions',
        details: error.message
      }
    });
  }
}

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Transaction not found'
        }
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('[ ERROR ] Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch transaction',
        details: error.message
      }
    });
  }
}

exports.insertOne = async (req, res) => {
  try {
    const {
      userId,
      categoryId,
      amount,
      type,
      description,
      date
    } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userId is required'
        }
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'categoryId is required'
        }
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'amount must be greater than 0'
        }
      });
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'type must be either "income" or "expense"'
        }
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    // Validate category type matches transaction type
    if (category.type !== type) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Category type "${category.type}" does not match transaction type "${type}"`
        }
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      categoryId,
      amount: parseFloat(amount),
      type,
      description: description || null,
      date: date ? new Date(date) : new Date()
    });

    // Fetch the created transaction with related data
    const createdTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: createdTransaction
    });

  } catch (error) {
    console.error('[ ERROR ] Create transaction error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create transaction',
        details: error.message
      }
    });
  }
}

exports.updateOne = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      amount,
      type,
      description,
      date
    } = req.body;

    // Find transaction
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Transaction not found'
        }
      });
    }

    // Validate inputs if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'amount must be greater than 0'
        }
      });
    }

    if (type !== undefined && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'type must be either "income" or "expense"'
        }
      });
    }

    // Check category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Category not found'
          }
        });
      }

      // Validate category type if both category and type are being updated
      const finalType = type || transaction.type;
      if (category.type !== finalType) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Category type "${category.type}" does not match transaction type "${finalType}"`
          }
        });
      }
    }

    // Update transaction
    const updateData = {};
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);

    await transaction.update(updateData);

    // Fetch updated transaction with related data
    const updatedTransaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('[ ERROR ] Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update transaction',
        details: error.message
      }
    });
  }
}

exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Transaction not found'
        }
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('[ ERROR ] Delete transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete transaction',
        details: error.message
      }
    });
  }
}