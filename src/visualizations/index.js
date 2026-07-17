import StackViz from "./StackViz";
import LinkedListViz from "./LinkedListViz";
import ArrayViz from "./ArrayViz";
import QueueViz from "./QueueViz";
import HashViz from "./HashViz";
import TreeViz from "./TreeViz";
import HeapViz from "./HeapViz";
import GraphViz from "./GraphViz";

export const VISUALIZATIONS = {
  stack: StackViz,
  linked_list: LinkedListViz,
  array: ArrayViz,
  queue: QueueViz,
  hash_table: HashViz,
  tree: TreeViz,
  heap: HeapViz,
  graph: GraphViz,
};

export function getVisualization(name) {
  return VISUALIZATIONS[name] || null;
}
