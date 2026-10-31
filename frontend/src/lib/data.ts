export type Source = "PDF" | "Video" | "Article";

export interface Concept {
  name: string;
  summary: string;
  related: string[];
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface QA {
  keywords: string[];
  q: string;
  a: string;
}

export interface Doc {
  id: string;
  title: string;
  source: Source;
  meta: string;
  blurb: string;
  mastery: number;
  quizzes: number;
  qa: QA[];
  fallback: string;
  quiz: Question[];
  concepts: Concept[];
}

export const DOCS: Doc[] = [
  {
    id: "transformers",
    title: "Attention Is All You Need",
    source: "PDF",
    meta: "15 pages · Vaswani et al., 2017",
    blurb: "The paper that introduced the Transformer architecture.",
    mastery: 82,
    quizzes: 3,
    fallback:
      "The paper centers on replacing recurrence with self-attention so that every token can look at every other token in parallel. Try asking about self-attention, multi-head attention, or positional encoding.",
    qa: [
      {
        keywords: ["self-attention", "attention", "how does"],
        q: "What is self-attention?",
        a: "Self-attention lets each token in a sequence weigh every other token when building its representation. Each token produces a query, key and value; the query is compared against all keys, and the resulting weights mix the values. [p. 3–4]",
      },
      {
        keywords: ["multi", "head", "heads"],
        q: "Why multi-head attention?",
        a: "Running several attention operations in parallel lets the model attend to different kinds of relationships at once, such as syntax in one head and long-range references in another. The outputs are concatenated and projected. The paper uses 8 heads. [p. 4–5]",
      },
      {
        keywords: ["position", "order", "sequence"],
        q: "How does it know word order?",
        a: "Attention alone has no sense of order, so the model adds positional encodings to the input embeddings. The paper uses fixed sine and cosine functions of different frequencies. [p. 6]",
      },
      {
        keywords: ["rnn", "recurrent", "lstm", "faster", "parallel"],
        q: "Why is it faster than RNNs?",
        a: "RNNs process tokens one after another, so training cannot be parallelised across a sequence. Transformers process all positions at once, which makes training far faster on modern hardware. [p. 2]",
      },
    ],
    quiz: [
      {
        q: "What mechanism does the Transformer use in place of recurrence?",
        options: ["Convolution", "Self-attention", "Pooling", "Dropout"],
        answer: 1,
        why: "The architecture relies entirely on self-attention to model dependencies between positions.",
      },
      {
        q: "Why are positional encodings added to the embeddings?",
        options: [
          "To reduce model size",
          "To normalise the inputs",
          "Attention has no built-in notion of order",
          "To speed up training",
        ],
        answer: 2,
        why: "Self-attention is permutation-invariant, so order information has to be injected separately.",
      },
      {
        q: "How many attention heads does the base model use?",
        options: ["2", "4", "8", "16"],
        answer: 2,
        why: "The base Transformer uses h = 8 parallel attention heads.",
      },
      {
        q: "What is the main training advantage over RNNs?",
        options: [
          "Fewer parameters",
          "Parallel computation across positions",
          "No need for data",
          "Lower memory use",
        ],
        answer: 1,
        why: "Without sequential dependencies, all positions can be computed at the same time.",
      },
    ],
    concepts: [
      { name: "Self-attention", summary: "Each token weighs all other tokens to build its representation.", related: ["Queries, keys, values", "Multi-head attention"] },
      { name: "Multi-head attention", summary: "Several attention operations in parallel, each learning different relationships.", related: ["Self-attention"] },
      { name: "Queries, keys, values", summary: "Three projections of each token used to compute attention weights.", related: ["Self-attention"] },
      { name: "Positional encoding", summary: "Sine and cosine signals added to embeddings to give the model word order.", related: ["Encoder–decoder"] },
      { name: "Encoder–decoder", summary: "A stack that reads the input and a stack that generates the output.", related: ["Positional encoding", "Self-attention"] },
    ],
  },
  {
    id: "neural-nets",
    title: "But what is a neural network?",
    source: "Video",
    meta: "19 min · transcript",
    blurb: "A visual walkthrough of layers, weights and learning.",
    mastery: 64,
    quizzes: 2,
    fallback:
      "The video builds up from a single neuron to a network that reads handwritten digits. Try asking about neurons, weights, or how the network learns.",
    qa: [
      {
        keywords: ["neuron", "what is"],
        q: "What is a neuron here?",
        a: "A neuron is simply a number between 0 and 1, called its activation. Each neuron in a layer is connected to every neuron in the previous layer. [02:10]",
      },
      {
        keywords: ["weight", "bias", "parameters"],
        q: "What do weights and biases do?",
        a: "A weight says how strongly one neuron influences another. A bias shifts how easily a neuron activates. Together they are the thousands of parameters the network tunes. [06:45]",
      },
      {
        keywords: ["learn", "training", "gradient", "descent"],
        q: "How does it learn?",
        a: "Learning means adjusting weights and biases to reduce a cost function that measures how wrong the output is. Gradient descent nudges every parameter in the direction that lowers the cost. [12:30]",
      },
      {
        keywords: ["layer", "hidden", "digit"],
        q: "Why use hidden layers?",
        a: "Hidden layers let the network build up abstractions: early layers might detect edges, later ones combine edges into shapes such as loops and lines that form digits. [08:20]",
      },
    ],
    quiz: [
      {
        q: "What does a neuron's activation represent?",
        options: ["A word", "A number between 0 and 1", "A weight", "An error"],
        answer: 1,
        why: "Each neuron holds a single number, its activation, between 0 and 1.",
      },
      {
        q: "What does gradient descent do?",
        options: [
          "Adds more layers",
          "Deletes weak neurons",
          "Adjusts parameters to lower the cost",
          "Increases the learning data",
        ],
        answer: 2,
        why: "It repeatedly steps parameters in the direction that decreases the cost function.",
      },
      {
        q: "What does a bias control?",
        options: [
          "How easily a neuron activates",
          "The number of layers",
          "The input size",
          "The speed of training",
        ],
        answer: 0,
        why: "A bias shifts the threshold at which a neuron becomes active.",
      },
    ],
    concepts: [
      { name: "Neuron", summary: "A unit holding a single activation value between 0 and 1.", related: ["Layers", "Weights and biases"] },
      { name: "Layers", summary: "Groups of neurons; hidden layers build progressively abstract features.", related: ["Neuron"] },
      { name: "Weights and biases", summary: "The tunable parameters that define what the network computes.", related: ["Cost function", "Neuron"] },
      { name: "Cost function", summary: "A single number measuring how wrong the network's output is.", related: ["Gradient descent"] },
      { name: "Gradient descent", summary: "Iteratively adjusting parameters to reduce the cost.", related: ["Cost function", "Weights and biases"] },
    ],
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis, explained",
    source: "Article",
    meta: "Web article · 8 min read",
    blurb: "How plants turn light, water and CO₂ into energy.",
    mastery: 38,
    quizzes: 1,
    fallback:
      "The article covers the two stages of photosynthesis and where they happen in the cell. Try asking about the light reactions, the Calvin cycle, or chlorophyll.",
    qa: [
      {
        keywords: ["what is", "overall", "equation", "photosynthesis"],
        q: "What is photosynthesis?",
        a: "Photosynthesis converts light energy into chemical energy. Plants take in carbon dioxide and water and, using sunlight, produce glucose and release oxygen.",
      },
      {
        keywords: ["light", "reaction", "thylakoid"],
        q: "What are the light reactions?",
        a: "They happen in the thylakoid membranes. Chlorophyll absorbs light, water is split to release oxygen, and the energy is stored in ATP and NADPH.",
      },
      {
        keywords: ["calvin", "cycle", "dark", "stroma"],
        q: "What is the Calvin cycle?",
        a: "Occurring in the stroma, the Calvin cycle uses ATP and NADPH from the light reactions to fix carbon dioxide into sugar. It does not need light directly.",
      },
      {
        keywords: ["chlorophyll", "green", "pigment"],
        q: "Why are plants green?",
        a: "Chlorophyll absorbs mostly red and blue light and reflects green, which is the colour we see.",
      },
    ],
    quiz: [
      {
        q: "Where do the light reactions take place?",
        options: ["Stroma", "Thylakoid membranes", "Nucleus", "Cell wall"],
        answer: 1,
        why: "Light reactions occur in the thylakoid membranes inside the chloroplast.",
      },
      {
        q: "Which gas is released as a by-product?",
        options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
        answer: 2,
        why: "Splitting water in the light reactions releases oxygen.",
      },
      {
        q: "What does the Calvin cycle produce?",
        options: ["Oxygen", "Sugar", "Chlorophyll", "Water"],
        answer: 1,
        why: "It fixes CO₂ into sugar using ATP and NADPH.",
      },
    ],
    concepts: [
      { name: "Chlorophyll", summary: "The green pigment that absorbs light energy.", related: ["Light reactions"] },
      { name: "Light reactions", summary: "Capture light and make ATP and NADPH, releasing oxygen.", related: ["Chlorophyll", "Calvin cycle"] },
      { name: "Calvin cycle", summary: "Uses ATP and NADPH to turn CO₂ into sugar.", related: ["Light reactions"] },
      { name: "ATP and NADPH", summary: "Energy carriers linking the two stages.", related: ["Light reactions", "Calvin cycle"] },
    ],
  },
];

export const getDoc = (id: string) => DOCS.find((d) => d.id === id);
