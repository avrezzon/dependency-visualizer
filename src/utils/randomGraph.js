const CATEGORIES = ['Foundation', 'Data Access', 'Readers', 'Processors'];
const ORGS = {
  Foundation: 'core',
  'Data Access': 'data',
  Readers: 'app',
  Processors: 'app',
};
const PREFIXES = {
  Foundation: ['common', 'shared', 'base', 'ext'],
  'Data Access': ['repo', 'store', 'db', 'cache'],
  Readers: ['reader', 'api', 'service', 'view'],
  Processors: ['proc', 'worker', 'engine', 'handler'],
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomVersion = () => {
  const major = Math.floor(Math.random() * 3) + 1; // 1-3
  const minor = Math.floor(Math.random() * 10);    // 0-9
  const patch = Math.floor(Math.random() * 20);    // 0-19
  return `${major}.${minor}.${patch}`;
};

export const generateRandomGraph = () => {
  const nodes = [];
  const edges = [];
  const dependencyLocks = {};

  const nodesByCategory = {
    Foundation: [],
    'Data Access': [],
    Readers: [],
    Processors: [],
  };

  // 1. Generate Nodes
  CATEGORIES.forEach(category => {
    const nodeCount = Math.floor(Math.random() * 3) + 2; // 2-4 nodes per category
    for (let i = 0; i < nodeCount; i++) {
      const prefix = getRandomElement(PREFIXES[category]);
      const name = `${prefix}-${String.fromCharCode(97 + i)}`; // e.g., repo-a
      const org = ORGS[category];
      const newNode = {
        id: `${org}:${name}`,
        org,
        artifactId: name,
        label: name,
        type: category === 'Foundation' ? 'core' : (category === 'Data Access' ? 'repo' : 'app'),
        version: generateRandomVersion(),
        category,
        history: [],
      };
      nodes.push(newNode);
      nodesByCategory[category].push(newNode);
      dependencyLocks[newNode.id] = {};
    }
  });

  // 2. Generate Edges (in a structured way to avoid cycles)
  const createRandomEdges = (sourceCategory, targetCategory, maxDeps = 2) => {
    nodesByCategory[targetCategory].forEach(targetNode => {
      const availableSources = [...nodesByCategory[sourceCategory]];
      const depCount = Math.min(availableSources.length, Math.floor(Math.random() * maxDeps) + 1);

      for (let i = 0; i < depCount; i++) {
        const sourceIndex = Math.floor(Math.random() * availableSources.length);
        const sourceNode = availableSources.splice(sourceIndex, 1)[0];
        if (sourceNode) {
          edges.push({ source: sourceNode.id, target: targetNode.id });
          // 3. Initialize dependency lock
          dependencyLocks[targetNode.id][sourceNode.id] = sourceNode.version;
        }
      }
    });
  };

  // Foundation -> Data Access
  createRandomEdges('Foundation', 'Data Access');
  // Foundation -> Readers
  createRandomEdges('Foundation', 'Readers', 1);
  // Data Access -> Readers
  createRandomEdges('Data Access', 'Readers');
  // Data Access -> Processors
  createRandomEdges('Data Access', 'Processors');
   // Readers -> Processors
  createRandomEdges('Readers', 'Processors', 1);


  return { nodes, edges, dependencyLocks };
};
