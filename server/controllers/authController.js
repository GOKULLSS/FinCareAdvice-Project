const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FinancialProfile = require('../models/FinancialProfile');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, age, cityTier, dependents, hasFamily } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      age: age !== undefined && age !== '' ? Number(age) : 0,
      cityTier: cityTier || 'metro',
      dependents: dependents !== undefined && dependents !== '' ? Number(dependents) : 0,
      hasFamily: hasFamily ?? (dependents > 0),
    });

    // Create a default initial financial profile for the user with empty / 0 values
    await FinancialProfile.create({
      userId: user._id,
      income: { salary: 0, business: 0, investments: 0, other: 0 },
      expensesConsumption: {
        rent: 0,
        groceries: 0,
        transport: 0,
        utilities: 0,
        dining: 0,
        subscriptions: 0,
      },
      expensesCommitment: { loans: 0, emis: 0, creditCards: 0 },
      safety: { emergencyFundBalance: 0, activeInsurancePremiums: 0 },
      growth: { sips: 0, investments: 0, courses: 0 },
      goals: {
        goalName: '',
        targetAmount: 0,
        timeHorizonYears: 0,
        riskProfile: 'Moderate',
      },
      flags: { hasStableJob: false, hasStableIncome: false },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        cityTier: user.cityTier,
        dependents: user.dependents,
        hasFamily: user.hasFamily,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        cityTier: user.cityTier,
        dependents: user.dependents,
        hasFamily: user.hasFamily,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        cityTier: user.cityTier,
        dependents: user.dependents,
        hasFamily: user.hasFamily,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user demographics
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateDemographics = async (req, res, next) => {
  try {
    const { name, age, cityTier, dependents, hasFamily } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (age !== undefined) fieldsToUpdate.age = Number(age);
    if (cityTier) fieldsToUpdate.cityTier = cityTier;
    if (dependents !== undefined) fieldsToUpdate.dependents = Number(dependents);
    if (hasFamily !== undefined) fieldsToUpdate.hasFamily = Boolean(hasFamily);

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'User demographics updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        cityTier: user.cityTier,
        dependents: user.dependents,
        hasFamily: user.hasFamily,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateDemographics,

};
