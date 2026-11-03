import type { ConceptEdge, ConceptNode, DocumentSourceType } from "@/types";

export interface SeedQuestion {
  question: string;
  options: [string, string, string, string];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface SeedTopic {
  topic: string;
  score: number | null;
  attempts: number;
}

export interface SeedDoc {
  id: string;
  title: string;
  source_type: DocumentSourceType;
  source_url: string | null;
  chunk_count: number;
  daysAgo: number;
  summary: string;
  important: string;
  qa: { keywords: string[]; answer: string }[];
  topics: SeedTopic[];
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  quiz: SeedQuestion[];
}

export const SEED_DOCS: SeedDoc[] = [
  {
    id: "demo-transformers",
    title: "Attention Is All You Need",
    source_type: "pdf",
    source_url: null,
    chunk_count: 64,
    daysAgo: 6,
    summary:
      "**Attention Is All You Need** introduces the *Transformer*, a model that drops recurrence and convolutions and relies entirely on attention.\n\n- **Self-attention** lets every token look at every other token in a sequence *(p. 3)*\n- **Multi-head attention** runs several attention operations in parallel *(p. 4–5)*\n- **Positional encodings** inject word order, since attention has none *(p. 6)*\n- Training is far more **parallelisable** than with RNNs, and results beat the best translation models of the time *(p. 8–9)*",
    important:
      "The most important idea is **self-attention**: instead of reading a sentence one word at a time, the model compares every word with every other word at once and learns which ones matter for each other. This removes the sequential bottleneck of RNNs and is what makes modern large language models practical to train *(p. 3)*.",
    qa: [
      {
        keywords: ["self-attention", "self attention", "attention"],
        answer:
          "Each token is turned into a **query**, a **key** and a **value**. A token's query is compared with every key to get weights, and those weights mix the values into a new representation.\n\n`Attention(Q, K, V) = softmax(QKᵀ / √d) · V` *(p. 4)*\n\nThe √d scaling keeps the dot products from growing too large and saturating the softmax.",
      },
      {
        keywords: ["multi", "head"],
        answer:
          "Multi-head attention runs **8 attention operations in parallel**, each on a smaller projection of the input. Different heads can specialise: one might track syntax, another long-range references. The results are concatenated and projected back *(p. 4–5)*.",
      },
      {
        keywords: ["position", "order", "sequence"],
        answer:
          "Attention is permutation-invariant, so the model has no sense of order by default. The paper adds **positional encodings**, fixed sine and cosine waves of different frequencies, to the input embeddings *(p. 6)*.",
      },
      {
        keywords: ["rnn", "recurrent", "lstm", "faster", "parallel"],
        answer:
          "RNNs must process tokens one after another, so training can't be parallelised across a sequence. Transformers compute all positions **at the same time**, which is dramatically faster on GPUs, and paths between distant tokens are short, making long-range dependencies easier to learn *(p. 2, 7)*.",
      },
      {
        keywords: ["encoder", "decoder", "architecture"],
        answer:
          "The model has an **encoder** stack that reads the input and a **decoder** stack that generates the output. Each has 6 identical layers made of attention plus a feed-forward network, with residual connections and layer normalisation *(p. 3)*.",
      },
    ],
    topics: [
      { topic: "Self-attention", score: 88, attempts: 3 },
      { topic: "Multi-head attention", score: 80, attempts: 2 },
      { topic: "Positional encoding", score: 52, attempts: 2 },
      { topic: "Encoder–decoder", score: null, attempts: 0 },
    ],
    nodes: [
      { id: "t", label: "Transformer", description: "Architecture built entirely on attention, with no recurrence." },
      { id: "sa", label: "Self-attention", description: "Each token weighs every other token to build its representation." },
      { id: "mh", label: "Multi-head attention", description: "Several attention operations run in parallel." },
      { id: "qkv", label: "Queries, keys, values", description: "Three projections used to compute attention weights." },
      { id: "pe", label: "Positional encoding", description: "Sine and cosine signals that give the model word order." },
      { id: "enc", label: "Encoder", description: "Stack of layers that reads the input sequence." },
      { id: "dec", label: "Decoder", description: "Stack of layers that generates the output sequence." },
      { id: "rnn", label: "RNNs", description: "Sequential models that the Transformer replaces." },
      { id: "par", label: "Parallel training", description: "All positions are computed at once, making training fast." },
    ],
    edges: [
      { source: "t", target: "sa", label: "built on" },
      { source: "sa", target: "mh", label: "extended by" },
      { source: "sa", target: "qkv", label: "uses" },
      { source: "t", target: "pe", label: "adds" },
      { source: "t", target: "enc", label: "has" },
      { source: "t", target: "dec", label: "has" },
      { source: "t", target: "rnn", label: "replaces" },
      { source: "t", target: "par", label: "enables" },
    ],
    quiz: [
      {
        question: "What does the Transformer use in place of recurrence?",
        options: ["A) Convolution", "B) Self-attention", "C) Pooling", "D) Dropout"],
        correct: "B",
        explanation: "The architecture relies entirely on self-attention to model dependencies between positions.",
      },
      {
        question: "Why are positional encodings added to the input embeddings?",
        options: [
          "A) To reduce model size",
          "B) To normalise the inputs",
          "C) Attention has no built-in notion of order",
          "D) To speed up training",
        ],
        correct: "C",
        explanation: "Self-attention is permutation-invariant, so order information must be injected separately.",
      },
      {
        question: "How many attention heads does the base model use?",
        options: ["A) 2", "B) 4", "C) 8", "D) 16"],
        correct: "C",
        explanation: "The base Transformer uses h = 8 parallel attention heads.",
      },
      {
        question: "What is the main training advantage over RNNs?",
        options: [
          "A) Fewer parameters",
          "B) Parallel computation across positions",
          "C) No training data needed",
          "D) Lower memory use",
        ],
        correct: "B",
        explanation: "Without sequential dependencies, all positions can be processed at the same time.",
      },
      {
        question: "In attention, what is compared against every key?",
        options: ["A) A value", "B) A bias", "C) A query", "D) An embedding table"],
        correct: "C",
        explanation: "Each token's query is compared with all keys to produce the attention weights.",
      },
      {
        question: "What does the √d scaling in attention prevent?",
        options: [
          "A) Overfitting",
          "B) Dot products growing so large the softmax saturates",
          "C) Vanishing embeddings",
          "D) Exploding batch sizes",
        ],
        correct: "B",
        explanation: "Large dot products push the softmax into regions with tiny gradients, so they are scaled down.",
      },
    ],
  },
  {
    id: "demo-neural-nets",
    title: "But what is a neural network?",
    source_type: "youtube",
    source_url: "https://www.youtube.com/watch?v=aircAruvnKk",
    chunk_count: 38,
    daysAgo: 4,
    summary:
      "The video builds a neural network up from scratch using handwritten digit recognition as the example.\n\n- A **neuron** holds a number between 0 and 1, its *activation* **[02:10]**\n- **Layers** of neurons are connected by **weights**, with a **bias** for each neuron **[06:45]**\n- Hidden layers let the network build up from edges to shapes to digits **[08:20]**\n- **Learning** means adjusting the weights and biases to lower a **cost function** **[12:30]**",
    important:
      "The key idea is that **learning is just finding good weights and biases**. The network has thousands of adjustable numbers, and gradient descent repeatedly nudges them in the direction that reduces the cost, which measures how wrong the network currently is **[12:30]**.",
    qa: [
      {
        keywords: ["neuron", "activation value"],
        answer:
          "A neuron is simply a **number between 0 and 1**, called its activation. In the first layer each neuron holds the brightness of one pixel; in the last layer each neuron represents how strongly the network believes the image is a particular digit **[02:10]**.",
      },
      {
        keywords: ["weight", "bias", "parameter"],
        answer:
          "A **weight** says how strongly one neuron in the previous layer influences a neuron in the next. A **bias** shifts how easily that neuron activates. For the digit network that adds up to roughly **13,000 parameters** to tune **[06:45]**.",
      },
      {
        keywords: ["learn", "train", "gradient", "descent", "cost"],
        answer:
          "Learning means minimising a **cost function**, the average error across training examples. **Gradient descent** computes which direction lowers the cost fastest and steps every weight and bias that way, over and over **[12:30]**.",
      },
      {
        keywords: ["hidden", "layer"],
        answer:
          "Hidden layers let the network build **abstractions**. The hope is that early layers detect edges, later ones combine edges into loops and lines, and the final layer combines those into digits **[08:20]**.",
      },
      {
        keywords: ["sigmoid", "activation", "squish"],
        answer:
          "A **sigmoid** function squishes any weighted sum into the 0–1 range so it can act as an activation. Modern networks often prefer ReLU because it trains more easily **[09:40]**.",
      },
    ],
    topics: [
      { topic: "Neurons and layers", score: 74, attempts: 2 },
      { topic: "Weights and biases", score: 61, attempts: 1 },
      { topic: "Gradient descent", score: 45, attempts: 2 },
    ],
    nodes: [
      { id: "nn", label: "Neural network", description: "Layers of connected neurons that learn from examples." },
      { id: "neu", label: "Neuron", description: "Holds a single activation between 0 and 1." },
      { id: "lay", label: "Layers", description: "Input, hidden and output groups of neurons." },
      { id: "wb", label: "Weights and biases", description: "Tunable parameters that define the network's behaviour." },
      { id: "act", label: "Activation function", description: "Squishes weighted sums into a useful range." },
      { id: "cost", label: "Cost function", description: "Measures how wrong the network's output is." },
      { id: "gd", label: "Gradient descent", description: "Repeatedly adjusts parameters to lower the cost." },
      { id: "bp", label: "Backpropagation", description: "Efficiently computes the gradient of the cost." },
    ],
    edges: [
      { source: "nn", target: "neu", label: "made of" },
      { source: "nn", target: "lay", label: "organised in" },
      { source: "lay", target: "wb", label: "connected by" },
      { source: "neu", target: "act", label: "applies" },
      { source: "nn", target: "cost", label: "evaluated by" },
      { source: "cost", target: "gd", label: "minimised by" },
      { source: "gd", target: "wb", label: "updates" },
      { source: "gd", target: "bp", label: "computed via" },
    ],
    quiz: [
      {
        question: "What does a neuron's activation represent in this network?",
        options: ["A) A word", "B) A number between 0 and 1", "C) A weight", "D) An error"],
        correct: "B",
        explanation: "Each neuron holds a single number, its activation, between 0 and 1.",
      },
      {
        question: "What does gradient descent do?",
        options: [
          "A) Adds more layers",
          "B) Deletes weak neurons",
          "C) Adjusts parameters to lower the cost",
          "D) Increases the amount of data",
        ],
        correct: "C",
        explanation: "It repeatedly steps the parameters in the direction that decreases the cost function.",
      },
      {
        question: "What does a bias control?",
        options: [
          "A) How easily a neuron activates",
          "B) The number of layers",
          "C) The input size",
          "D) The training speed",
        ],
        correct: "A",
        explanation: "A bias shifts the threshold at which a neuron becomes active.",
      },
      {
        question: "What does the cost function measure?",
        options: ["A) Training time", "B) Memory use", "C) How wrong the network's outputs are", "D) Layer width"],
        correct: "C",
        explanation: "The cost averages the error over training examples; lower is better.",
      },
      {
        question: "Why have hidden layers at all?",
        options: [
          "A) To build up abstractions such as edges and shapes",
          "B) To slow down training",
          "C) To store the dataset",
          "D) To normalise pixels",
        ],
        correct: "A",
        explanation: "Hidden layers let the network compose simple features into more complex ones.",
      },
    ],
  },
  {
    id: "demo-photosynthesis",
    title: "Photosynthesis, explained",
    source_type: "web",
    source_url: "https://en.wikipedia.org/wiki/Photosynthesis",
    chunk_count: 27,
    daysAgo: 2,
    summary:
      "The article explains how plants, algae and some bacteria turn light into chemical energy.\n\n- Overall: **CO₂ + water + light → glucose + oxygen**\n- **Light reactions** happen in the *thylakoid membranes* and produce ATP, NADPH and O₂\n- The **Calvin cycle** happens in the *stroma* and uses ATP and NADPH to fix CO₂ into sugar\n- **Chlorophyll** absorbs red and blue light and reflects green",
    important:
      "The most important idea is that photosynthesis is **two linked stages**: the light reactions capture energy as ATP and NADPH, and the Calvin cycle spends that energy to build sugar from CO₂. Neither stage works without the other.",
    qa: [
      {
        keywords: ["photosynthesis", "equation"],
        answer:
          "Photosynthesis converts **light energy into chemical energy**. Plants take in carbon dioxide and water and, using sunlight, produce **glucose** and release **oxygen**.",
      },
      {
        keywords: ["light", "reaction", "thylakoid"],
        answer:
          "The light reactions happen in the **thylakoid membranes**. Chlorophyll absorbs light, water is split (releasing O₂), and the captured energy is stored as **ATP** and **NADPH**.",
      },
      {
        keywords: ["calvin", "cycle", "dark", "stroma", "sugar"],
        answer:
          "The **Calvin cycle** takes place in the **stroma**. It uses the ATP and NADPH from the light reactions to *fix* CO₂ into sugar. It doesn't need light directly, but it depends on the products of the light reactions.",
      },
      {
        keywords: ["chlorophyll", "green", "pigment", "colour", "color"],
        answer:
          "Chlorophyll absorbs mostly **red and blue** light and reflects **green**, which is why leaves look green.",
      },
    ],
    topics: [
      { topic: "Light reactions", score: 91, attempts: 2 },
      { topic: "Calvin cycle", score: 85, attempts: 1 },
      { topic: "Chlorophyll", score: null, attempts: 0 },
    ],
    nodes: [
      { id: "ps", label: "Photosynthesis", description: "Converts light, water and CO₂ into glucose and oxygen." },
      { id: "chl", label: "Chlorophyll", description: "Green pigment that absorbs light energy." },
      { id: "lr", label: "Light reactions", description: "Capture light to make ATP and NADPH, releasing O₂." },
      { id: "cc", label: "Calvin cycle", description: "Uses ATP and NADPH to turn CO₂ into sugar." },
      { id: "thy", label: "Thylakoid", description: "Membranes where the light reactions occur." },
      { id: "str", label: "Stroma", description: "Fluid where the Calvin cycle occurs." },
      { id: "atp", label: "ATP and NADPH", description: "Energy carriers linking the two stages." },
      { id: "glu", label: "Glucose", description: "The sugar product that stores the energy." },
    ],
    edges: [
      { source: "ps", target: "lr", label: "stage 1" },
      { source: "ps", target: "cc", label: "stage 2" },
      { source: "lr", target: "chl", label: "absorbed by" },
      { source: "lr", target: "thy", label: "occurs in" },
      { source: "cc", target: "str", label: "occurs in" },
      { source: "lr", target: "atp", label: "produces" },
      { source: "atp", target: "cc", label: "powers" },
      { source: "cc", target: "glu", label: "builds" },
    ],
    quiz: [
      {
        question: "Where do the light reactions take place?",
        options: ["A) Stroma", "B) Thylakoid membranes", "C) Nucleus", "D) Cell wall"],
        correct: "B",
        explanation: "Light reactions occur in the thylakoid membranes inside the chloroplast.",
      },
      {
        question: "Which gas is released as a by-product?",
        options: ["A) Carbon dioxide", "B) Nitrogen", "C) Oxygen", "D) Hydrogen"],
        correct: "C",
        explanation: "Splitting water in the light reactions releases oxygen.",
      },
      {
        question: "What does the Calvin cycle produce?",
        options: ["A) Oxygen", "B) Sugar", "C) Chlorophyll", "D) Water"],
        correct: "B",
        explanation: "It fixes CO₂ into sugar using ATP and NADPH.",
      },
      {
        question: "Why do leaves look green?",
        options: [
          "A) Chlorophyll reflects green light",
          "B) Chlorophyll absorbs green light",
          "C) Water is green",
          "D) Glucose is green",
        ],
        correct: "A",
        explanation: "Chlorophyll absorbs red and blue light and reflects green.",
      },
      {
        question: "What links the light reactions to the Calvin cycle?",
        options: ["A) Oxygen", "B) Glucose", "C) ATP and NADPH", "D) Chlorophyll"],
        correct: "C",
        explanation: "ATP and NADPH carry the captured energy to the Calvin cycle.",
      },
    ],
  },
];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
