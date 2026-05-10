// Experience Service
// Business logic for ownership experiences

const OwnershipExperience = require('../models/OwnershipExperience');
const experienceRepository = require('../repositories/experienceRepository');
const { callUserService, ContextHolder } = require('@dhakdhakgo/shared');

/**
 * Create a new ownership experience
 * @param {string} authorId - Owner user ID
 * @param {Object} experienceData - Experience data
 * @returns {Promise<OwnershipExperience>} Created experience
 */
const createExperience = async (authorId, experienceData) => {
  // Verify user exists
  try {
    const userInfoToken = ContextHolder.getInfoForKey('userInfoToken');
    await callUserService({
      method: 'GET',
      path: `/api/users/${authorId}`,
      additionalHeaders: { 'x-user-info': userInfoToken }
    });
  } catch (error) {
    throw new Error('User not found. Please register first.');
  }

  // Create experience instance
  const experience = new OwnershipExperience({
    ...experienceData,
    authorId
  });

  // Validate
  const validation = experience.validate();
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Save to database
  const savedExperience = await experienceRepository.create(experience);

  // Update user counter
  try {
    //await incrementOrDecrementUserCounter(authorId, 'totalExperiences');
  } catch (error) {
    console.error('Failed to update user counter:', error);
    // Don't fail the request
  }

  return savedExperience;
};

/**
 * Get experience by ID
 * @param {string} experienceId - Experience ID
 * @returns {Promise<OwnershipExperience>} Experience instance
 */
const getExperienceById = async (experienceId) => {
  const experience = await experienceRepository.findById(experienceId);
  
  if (!experience) {
    throw new Error('Experience not found');
  }
  
  return experience;
};

const getExperiencesBasedOnCriteria = async (criteria) => {
  return experienceRepository.findByCriteria(criteria);
};

/**
 * Get all experiences with pagination
 * @param {number} limit - Number of experiences to fetch
 * @param {string} lastDocId - Last document ID for pagination
 * @returns {Promise<Array<OwnershipExperience>>} Array of experiences
 */
const getAllExperiences = async (limit = 20, lastDocId = null) => {
  return await experienceRepository.findAll(limit, lastDocId);
};

/**
 * Get experiences by bike name
 * @param {string} bikeName - Bike name
 * @param {number} limit - Number of experiences to fetch
 * @returns {Promise<Array<OwnershipExperience>>} Array of experiences
 */
const getExperiencesByBike = async (bikeName, limit = 20) => {
  return await experienceRepository.findByBikeName(bikeName, limit);
};

/**
 * Get experiences by owner
 * @param {string} authorId - Owner ID
 * @param {number} limit - Number of experiences to fetch
 * @returns {Promise<Array<OwnershipExperience>>} Array of experiences
 */
const getExperiencesByOwner = async (authorId, limit = 20) => {
  return await experienceRepository.findByAuthor(authorId, limit);
};

/**
 * Update experience
 * @param {string} experienceId - Experience ID
 * @param {string} authorId - Owner ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<OwnershipExperience>} Updated experience
 */
const updateExperience = async (experienceId, authorId, updateData) => {
  // Get existing experience
  const experience = await getExperienceById(experienceId);

  // Check ownership
  if (experience.authorId !== authorId) {
    throw new Error('Unauthorized: You can only update your own experiences');
  }

  // Update allowed fields
  const allowedFields = [
    'ownershipDuration',
    'kmDriven',
    'maintenanceCost',
    'fuelEfficiency',
    'reliabilityRating',
    'comfortRating',
    'performanceRating',
    'valueForMoneyRating',
    'overallExperience',
    'pros',
    'cons',
    'issues',
    'images',
    'tags'
  ];
  
  const filteredData = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  // Update in database
  const updatedExperience = await experienceRepository.update(experienceId, filteredData);
  
  return updatedExperience;
};

/**
 * Delete experience
 * @param {string} experienceId - Experience ID
 * @param {string} authorId - Owner ID (for authorization)
 * @returns {Promise<void>}
 */
const deleteExperience = async (experienceId, authorId) => {
  // Get existing experience
  const experience = await getExperienceById(experienceId);

  // Check ownership
  if (experience.authorId !== authorId) {
    throw new Error('Unauthorized: You can only delete your own experiences');
  }

  // Delete from database
  await experienceRepository.deleteExperience(experienceId);

  // Decrement user counter
  try {
    await incrementUserCounter(authorId, 'totalExperiences'); // This should be decrement
  } catch (error) {
    console.error('Failed to update user counter:', error);
  }
};

/**
 * Increment like count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const incrementLikeCount = async (experienceId) => {
  await experienceRepository.incrementLikeCount(experienceId);
};

/**
 * Decrement like count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const decrementLikeCount = async (experienceId) => {
  await experienceRepository.decrementLikeCount(experienceId);
};

/**
 * Increment comment count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const incrementCommentCount = async (experienceId) => {
  await experienceRepository.incrementCommentCount(experienceId);
};

/**
 * Decrement comment count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const decrementCommentCount = async (experienceId) => {
  await experienceRepository.decrementCommentCount(experienceId);
};

module.exports = {
  createExperience,
  getExperienceById,
  getAllExperiences,
  getExperiencesBasedOnCriteria,
  getExperiencesByBike,
  getExperiencesByOwner,
  updateExperience,
  deleteExperience,
  incrementLikeCount,
  decrementLikeCount,
  incrementCommentCount,
  decrementCommentCount
};
