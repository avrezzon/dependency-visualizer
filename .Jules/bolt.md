## 2024-05-23 - Recursion and Array Spreading
**Learning:** In recursive graph traversals (`checkNodeState`), spreading arrays (`[...prev, ...new]`) or pushing spread arrays (`arr.push(...items)`) inside loops creates significant overhead due to intermediate array allocations and iterations.
**Action:** Use `Map` or `Set` to accumulate results directly during traversal, then convert to an array only once at the end. This reduces complexity from effectively quadratic (due to repeated copying) to linear relative to the number of items.

## 2024-05-24 - Component Memoization in Interactive Lists
**Learning:** In interactive lists where a global interaction (like hover) updates styles for a subset of items, inline rendering forces all items to re-render.
**Action:** Extract the list item into a `React.memo` component. This ensures only the items with changed props (e.g., `isHighlighted`) re-render, drastically reducing the Virtual DOM diffing overhead.

## 2024-05-24 - Separation of Graph Status and Details
**Learning:** Calculating detailed error information (transitive chains, object creation) for every node in a graph visualization is wasted effort if the graph only displays a boolean status (e.g., red/green) and only the selected node shows details.
**Action:** Split the calculation into two parts: a fast, boolean-only map for the entire graph (O(N)), and a detailed calculation lazily computed only for the selected node. This reduced calculation time by ~137x in benchmarks.
