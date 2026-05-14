export const likertQuestions = [
  { id: 'likert-1', prompt: 'I can explain the basic parts of a biological neuron.' },
  { id: 'likert-2', prompt: 'I understand how signals move from one neuron to another.' },
  { id: 'likert-3', prompt: 'I can explain how an artificial neuron is similar to a biological neuron.' },
  { id: 'likert-4', prompt: 'I understand the basic idea of how artificial neural networks use inputs, weights, and activation functions.' },
  { id: 'likert-5', prompt: 'I understand the basic idea of how AI systems learn from feedback, including weight updates.' },
  { id: 'likert-6', prompt: 'I am interested in learning more about neuroscience and artificial intelligence.' },
]

export const openEndedQuestions = [
  { id: 'open-1', prompt: 'What do you find most helpful from the website and lecture/lab?' },
  { id: 'open-2', prompt: 'Where do you think this website/lecture/lab could be improved?' },
  { id: 'open-3', prompt: 'Feel free to share any suggestions or comments!' },
]

export const answerKey = {
  q1: {
    correctAnswer: 'C',
    explanation: 'This matches the selective-attention idea in Module 1: meaningful inputs can contribute more strongly to reaching threshold.',
  },
  q2: {
    correctAnswer: 'A',
    explanation: 'The combined input is 18 + 22 + 35 = 75, which is above the threshold of 70, so the neuron should fire.',
  },
  q3: {
    correctAnswer: 'D',
    explanation: 'The bridge section emphasizes that artificial neurons are inspired by the structure and function of biological neurons, but simplify those ideas into a computational model.',
  },
  q4: {
    correctAnswer: 'A',
    explanation: 'Hidden layers allow the network to combine simpler features into more abstract patterns.',
  },
  q5: {
    correctAnswer: 'C',
    explanation: 'For ReLU, f(x) = max(0, x). If x = -2, the output is 0.',
  },
  q6: {
    correctAnswer: 'B',
    explanation: 'Different weights create different feature preferences, which is the basis of selectivity.',
  },
  q7: {
    correctAnswer: 'D',
    explanation: 'With input size 5, kernel size 3, no padding, and stride 1, the output size is 5 - 3 + 1 = 3, so the result is 3x3.',
  },
  q8: {
    correctAnswer: 'C',
    explanation: 'Using the CNN convention with no kernel flipping, the patch produces 1 after summing the row-wise products.',
  },
  q9: {
    correctAnswer: 'D',
    explanation: 'Using a correct answer or target to measure error and update weights is supervised learning, while learning from rewards and penalties is reinforcement learning.',
  },
  q10: {
    correctAnswer: 'B',
    explanation: 'Backpropagation uses error information to determine which weights should be updated.',
  },
}

export const knowledgeQuestions = [
  {
    id: 'q1',
    module: 'module1',
    concept: 'Threshold / meaningful input',
    question: 'In Module 1, the phrase "Alex" is more likely to trigger firing than "page turning" because:',
    choices: [
      { id: 'A', text: 'dendrites only respond to words, not background sounds' },
      { id: 'B', text: 'all sounds are treated equally once they reach the ear' },
      { id: 'C', text: 'meaningful inputs can contribute more strongly to reaching threshold' },
      { id: 'D', text: 'the axon decides which sound is important before the soma does' },
    ],
    correctAnswer: answerKey.q1.correctAnswer,
    explanation: answerKey.q1.explanation,
  },
  {
    id: 'q2',
    module: 'module1',
    concept: 'Summation / threshold',
    question: 'In the sound experiment, suppose three inputs reach the soma close together with strengths 18, 22, and 35, and the threshold is 70. What should happen?',
    choices: [
      { id: 'A', text: 'The neuron fires because the combined input reaches 75' },
      { id: 'B', text: 'The neuron definitely stays quiet because no single input reached 70' },
      { id: 'C', text: 'The neuron fires only if the axon is already active' },
      { id: 'D', text: 'The neuron stays quiet because only two inputs can combine at once' },
    ],
    correctAnswer: answerKey.q2.correctAnswer,
    explanation: answerKey.q2.explanation,
  },
  {
    id: 'q3',
    module: 'synthesis',
    concept: 'Biological neuron to artificial neuron bridge',
    question: 'Which statement best matches the "Bridge" section from biological neurons to artificial neurons?',
    choices: [
      { id: 'A', text: 'Artificial neurons are exact copies of biological neurons' },
      { id: 'B', text: 'Biological neurons use thresholds, but artificial neurons do not' },
      { id: 'C', text: 'Artificial neurons only work when modeled after a full real brain circuit' },
      { id: 'D', text: 'Artificial neurons are inspired by the structure and function of biological neurons, but simplify those ideas into a model that combines inputs and produces an output' },
    ],
    correctAnswer: answerKey.q3.correctAnswer,
    explanation: answerKey.q3.explanation,
  },
  {
    id: 'q4',
    module: 'module2',
    concept: 'Hidden layers / feature hierarchy',
    question: 'In Module 2A, why does adding hidden layers make a network more powerful?',
    choices: [
      { id: 'A', text: 'Deeper layers can combine simpler features into more complex patterns' },
      { id: 'B', text: 'Hidden layers guarantee that the model will always be correct' },
      { id: 'C', text: 'Hidden layers remove the need for activation functions' },
      { id: 'D', text: 'More layers automatically mean less training is needed' },
    ],
    correctAnswer: answerKey.q4.correctAnswer,
    explanation: answerKey.q4.explanation,
  },
  {
    id: 'q5',
    module: 'module2',
    concept: 'ReLU activation',
    question: 'In Module 2B, if the input to a ReLU unit is x = -2, which output is most reasonable?',
    choices: [
      { id: 'A', text: '-2' },
      { id: 'B', text: '0.5' },
      { id: 'C', text: '0' },
      { id: 'D', text: '2' },
    ],
    correctAnswer: answerKey.q5.correctAnswer,
    explanation: answerKey.q5.explanation,
  },
  {
    id: 'q6',
    module: 'module2',
    concept: 'Selectivity / weights',
    question: 'In the selectivity activity, two artificial neurons are shown the same 3x3 input pattern but respond differently. What is the best explanation?',
    choices: [
      { id: 'A', text: 'the input pattern changes automatically for each neuron' },
      { id: 'B', text: 'they have different weights, so they prefer different features' },
      { id: 'C', text: 'one neuron is biological and the other is artificial' },
      { id: 'D', text: 'they must be in different layers, so they cannot compare the same pattern' },
    ],
    correctAnswer: answerKey.q6.correctAnswer,
    explanation: answerKey.q6.explanation,
  },
  {
    id: 'q7',
    module: 'module2',
    concept: 'CNN output size',
    question: 'In the CNN section, a 5x5 input is scanned by a 3x3 filter with no padding and stride = 1. What is the output size?',
    choices: [
      { id: 'A', text: '2x2' },
      { id: 'B', text: '4x4' },
      { id: 'C', text: '5x5' },
      { id: 'D', text: '3x3' },
    ],
    correctAnswer: answerKey.q7.correctAnswer,
    explanation: answerKey.q7.explanation,
  },
  {
    id: 'q8',
    module: 'module2',
    concept: 'CNN filter calculation',
    question: 'Using the CNN convention (no kernel flipping), with no padding and stride = 1, a 3x3 filter is applied to this 3x3 image patch: [[3, 1, 0], [2, 2, 1], [0, 1, 3]] using this kernel: [[1, 0, -1], [1, 0, -1], [1, 0, -1]]. What is the output for that patch?',
    choices: [
      { id: 'A', text: '-1' },
      { id: 'B', text: '0' },
      { id: 'C', text: '1' },
      { id: 'D', text: '3' },
    ],
    correctAnswer: answerKey.q8.correctAnswer,
    explanation: answerKey.q8.explanation,
  },
  {
    id: 'q9',
    module: 'module3',
    concept: 'Supervised vs reinforcement learning',
    question: 'Which pairing is correct?',
    choices: [
      { id: 'A', text: 'Comparing a prediction with a correct answer -> reinforcement learning; learning from rewards and penalties -> supervised learning' },
      { id: 'B', text: 'Comparing a prediction with a correct answer -> unsupervised learning; learning from rewards and penalties -> supervised learning' },
      { id: 'C', text: 'Comparing a prediction with a correct answer -> feature extraction; learning from rewards and penalties -> convolution' },
      { id: 'D', text: 'Comparing a prediction with a correct answer -> supervised learning; learning from rewards and penalties -> reinforcement learning' },
    ],
    correctAnswer: answerKey.q9.correctAnswer,
    explanation: answerKey.q9.explanation,
  },
  {
    id: 'q10',
    module: 'module3',
    concept: 'Backpropagation / weight updates',
    question: 'In the backpropagation section, what is the main purpose of sending error backward through the network?',
    choices: [
      { id: 'A', text: 'to create new hidden layers automatically' },
      { id: 'B', text: 'to decide which weights should be updated' },
      { id: 'C', text: 'to replace the forward pass with a backward pass' },
      { id: 'D', text: 'to turn predictions directly into labels' },
    ],
    correctAnswer: answerKey.q10.correctAnswer,
    explanation: answerKey.q10.explanation,
  },
]
