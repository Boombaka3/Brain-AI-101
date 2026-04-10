/**
 * Pure neuron logic functions shared across modules
 */

/**
 * Calculate total input from array of input values
 * @param {number[]} inputs - Array of input values
 * @returns {number} Sum of all inputs
 */
export function calculateTotal(inputs) {
  return inputs.reduce((sum, value) => sum + value, 0)
}

/**
 * Determine if neuron fires based on total input and threshold
 * @param {number} totalInput - Sum of weighted inputs
 * @param {number} threshold - Firing threshold
 * @returns {boolean} True if neuron fires
 */
export function neuronFires(totalInput, threshold) {
  return totalInput >= threshold
}

/**
 * Calculate downstream input based on source neuron firing
 * @param {boolean} sourceFires - Whether source neuron fired
 * @param {number} weight - Connection weight (default 1)
 * @returns {number} Input value for downstream neuron
 */
export function getDownstreamInput(sourceFires, weight = 1) {
  return sourceFires ? weight : 0
}
