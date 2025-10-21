const userService = require('../services/userService');

/**
 * Register or get user profile
 * Creates user if doesn't exist, returns existing user otherwise
 */
const registerUser = async (req, res, next) => {
  try {
    // Extract Firebase user data from authenticated request
    const firebaseUser = {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    };

    // Call service layer
    const result = await userService.registerUser(firebaseUser);

    // Return response
    const statusCode = result.isNew ? 201 : 200;
    const message = result.isNew ? 'User registered successfully' : 'User already registered';

    res.status(statusCode).json({
      success: true,
      message,
      data: result.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user's profile
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user.uid;

    // Call service layer
    const user = await userService.getUserById(userId);

    // Return response
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile by ID
 */
const getUserById = async (req, res, next) => {
  try {
    // Extract user ID from request params
    const { userId } = req.params;

    // Call service layer
    const user = await userService.getUserById(userId);

    // Return response
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateUser = async (req, res, next) => {
  try {
    // Extract data from request
    const { userId } = req.params;
    const { displayName, photoURL } = req.body;

    // Prepare update data
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    // Call service layer
    const updatedUser = await userService.updateUserProfile(userId, updateData);

    // Return response
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res, next) => {
  try {
    // Extract user ID from request params
    const { userId } = req.params;

    // Call service layer
    const stats = await userService.getUserStats(userId);

    // Return response
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Increment user counter (internal endpoint for other services)
 */
const incrementCounter = async (req, res, next) => {
  try {
    // Extract data from request
    const { userId } = req.params;
    const { counterType } = req.body;

    // Call service layer
    await userService.incrementCounter(userId, counterType);

    // Return response
    res.json({
      success: true,
      message: `Counter ${counterType} incremented`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Decrement user counter (internal endpoint for other services)
 */
const decrementCounter = async (req, res, next) => {
  try {
    // Extract data from request
    const { userId } = req.params;
    const { counterType } = req.body;

    // Call service layer
    await userService.decrementCounter(userId, counterType);

    // Return response
    res.json({
      success: true,
      message: `Counter ${counterType} decremented`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  getCurrentUser,
  getUserById,
  updateUser,
  getUserStats,
  incrementCounter,
  decrementCounter
};
