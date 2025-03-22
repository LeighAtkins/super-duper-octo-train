/**
 * Sleep Debt Calculator
 * Tracks weekly sleep patterns and calculates sleep debt
 */

// Default sleep hours log for the week (Monday to Sunday)
const defaultSleepHoursLog = [7, 6, 5, 4, 3, 2, 1];

// Days of the week array for reference
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Get sleep hours for a specific day
 * @param {string} day - Day of the week (case insensitive)
 * @param {Array} sleepLog - Array of sleep hours for each day
 * @returns {number} Hours of sleep for the specified day
 * @throws {Error} If day is invalid or sleepLog is malformed
 */
const getSleepHours = (day, sleepLog = defaultSleepHoursLog) => {
  if (!Array.isArray(sleepLog) || sleepLog.length !== 7) {
    throw new Error('Sleep log must be an array of 7 days');
  }

  const dayIndex = days.indexOf(day.toLowerCase());
  
  if (dayIndex === -1) {
    throw new Error('Invalid day of the week');
  }

  return sleepLog[dayIndex];
};

/**
 * Calculate total actual sleep hours for the week
 * @param {Array} sleepLog - Array of sleep hours for each day
 * @returns {number} Total hours of sleep for the week
 */
const getActualSleepHours = (sleepLog = defaultSleepHoursLog) => {
  return days.reduce((total, day) => total + getSleepHours(day, sleepLog), 0);
};

/**
 * Calculate ideal sleep hours for the week
 * @param {number} idealHours - Ideal hours of sleep per day
 * @returns {number} Total ideal hours of sleep for the week
 * @throws {Error} If idealHours is not a positive number
 */
const getIdealSleepHours = (idealHours) => {
  if (typeof idealHours !== 'number' || idealHours <= 0) {
    throw new Error('Ideal hours must be a positive number');
  }
  return idealHours * 7;
};

/**
 * Calculate sleep debt and provide detailed analysis
 * @param {number} idealHours - Ideal hours of sleep per day
 * @param {Array} sleepLog - Array of sleep hours for each day
 * @returns {Object} Analysis of sleep patterns including debt and recommendations
 */
const calculateSleepDebt = (idealHours = 8, sleepLog = defaultSleepHoursLog) => {
  try {
    const idealSleepHours = getIdealSleepHours(idealHours);
    const actualSleepHours = getActualSleepHours(sleepLog);
    const missingSleep = idealSleepHours - actualSleepHours;
    const averageSleep = actualSleepHours / 7;

    const analysis = {
      idealSleepHours,
      actualSleepHours,
      averageSleepPerDay: averageSleep.toFixed(1),
      missingSleep,
      status: '',
      recommendations: []
    };

    if (idealSleepHours === actualSleepHours) {
      analysis.status = 'Perfect sleep schedule!';
    } else if (idealSleepHours > actualSleepHours) {
      analysis.status = `You are undersleeping by ${missingSleep} hours this week`;
      analysis.recommendations.push(
        `Try to get ${(missingSleep / 7).toFixed(1)} more hours of sleep per day`,
        'Consider going to bed earlier or improving sleep quality'
      );
    } else {
      analysis.status = `You are oversleeping by ${Math.abs(missingSleep)} hours this week`;
      analysis.recommendations.push(
        'Consider maintaining a more consistent sleep schedule',
        'Try to wake up earlier to align with your ideal sleep hours'
      );
    }

    return analysis;
  } catch (error) {
    throw new Error(`Error calculating sleep debt: ${error.message}`);
  }
};

// Export the function for use in other files
module.exports = {
  calculateSleepDebt
};

// Example usage
try {
  const analysis = calculateSleepDebt(8);
  console.log('Sleep Analysis:');
  console.log(analysis.status);
  console.log(`Average sleep per day: ${analysis.averageSleepPerDay} hours`);
  if (analysis.recommendations.length > 0) {
    console.log('\nRecommendations:');
    analysis.recommendations.forEach(rec => console.log(`- ${rec}`));
  }
} catch (error) {
  console.error('Error:', error.message);
}