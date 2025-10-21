// Experience Controller
// HTTP request handling for ownership experiences

const experienceService = require('../services/experienceService');

/**
 * Create a new ownership experience
 */
const createExperience = async (req, res, next) => {
  try {
    // Extract data from request
    const ownerId = req.user.uid;
    const experienceData = req.body;

    // Call service layer
    const createdExperience = await experienceService.createExperience(ownerId, experienceData);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: createdExperience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ownership experiences with pagination
 */
const getAllExperiences = async (req, res, next) => {
  try {
    // Extract query parameters
    const { limit = 20, lastDocId, bikeName, ownerId } = req.query;
    
    let experiences;
    
    // Route to appropriate service method
    if (bikeName) {
      experiences = await experienceService.getExperiencesByBike(bikeName, parseInt(limit));
    } else if (ownerId) {
      experiences = await experienceService.getExperiencesByOwner(ownerId, parseInt(limit));
    } else {
      experiences = await experienceService.getAllExperiences(parseInt(limit), lastDocId);
    }
    
    // Return response
    res.json({
      success: true,
      count: experiences.length,
      data: experiences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get experience by ID
 */
const getExperienceById = async (req, res, next) => {
  try {
    // Extract experience ID from params
    const { id } = req.params;
    
    // Call service layer
    const experience = await experienceService.getExperienceById(id);
    
    // Return response
    res.json({
      success: true,
      data: experience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update experience
 */
const updateExperience = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const ownerId = req.user.uid;
    const updateData = req.body;
    
    // Call service layer
    const updatedExperience = await experienceService.updateExperience(id, ownerId, updateData);
    
    // Return response
    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: updatedExperience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete experience
 */
const deleteExperience = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const ownerId = req.user.uid;
    
    // Call service layer
    await experienceService.deleteExperience(id, ownerId);
    
    // Return response
    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExperience,
  getAllExperiences,
  getExperience: getExperienceById,        // Alias for routes compatibility
  getExperienceById,                        // Keep original name
  getExperiencesByUser: getAllExperiences,  // Temp alias - needs proper implementation
  updateExperience,
  deleteExperience
};