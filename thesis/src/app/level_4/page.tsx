'use client';

import Link from "next/dist/client/link";
import React, { useMemo, useState } from "react";

// Level 4 – Choosing Splits with Gini Index and Entropy
export default function Level4BakeML() {
  type Pastry = {
    id: number;
    sweetness: "low" | "medium" | "high";
    roundness: "low" | "high";
    topping: boolean;
    filling: boolean;
    label: string;
  };

  const dataset: Pastry[] = [
    { id: 1, sweetness: "high", roundness: "high", topping: true, filling: false, label: "Cake" },
    { id: 2, sweetness: "low", roundness: "low", topping: false, filling: false, label: "Bread" },
    { id: 3, sweetness: "low", roundness: "high", topping: false, filling: false, label: "Bun" },
    { id: 4, sweetness: "high", roundness: "low", topping: true, filling: true, label: "Pastry" },
    { id: 5, sweetness: "medium", roundness: "low", topping: false, filling: false, label: "Bread" },
    { id: 6, sweetness: "high", roundness: "high", topping: false, filling: false, label: "Donut" },
    { id: 7, sweetness: "medium", roundness: "low", topping: false, filling: true, label: "Croissant" },
  ];

  type FeatureKey = "sweetness" | "roundness" | "topping" | "filling";

  type SplitOption = {
    feature: FeatureKey;
    description: string;
  };

  const splits: SplitOption[] = [
    { feature: "sweetness", description: "Sweetness = high vs. not high" },
    { feature: "roundness", description: "Roundness = high vs. low" },
    { feature: "topping", description: "Has topping vs. no topping" },
    { feature: "filling", description: "Has filling vs. no filling" },
  ];

  type NodeId = string;
  const ROOT_ID: NodeId = "root";

  const splitByFeature = useMemo(() => {
    const map = new Map<FeatureKey, SplitOption>();
    for (const s of splits) map.set(s.feature, s);
    return map;
  }, [splits]);

  const [selectedNodeId, setSelectedNodeId] = useState<NodeId>(ROOT_ID);
  const [splitsByNode, setSplitsByNode] = useState<Record<NodeId, FeatureKey>>({});
  const [actions, setActions] = useState<Array<{ nodeId: NodeId; feature: FeatureKey }>>([]);
  const [finished, setFinished] = useState(false);

  function giniForRows(rows: Pastry[]) {
    if (rows.length === 0) return 0;
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.label, (counts.get(row.label) ?? 0) + 1);
    let sumSquares = 0;
    for (const count of counts.values()) {
      const p = count / rows.length;
      sumSquares += p * p;
    }
    return 1 - sumSquares;
  }

  function predicateForFeature(feature: FeatureKey) {
    switch (feature) {
      case "sweetness":
        return (row: Pastry) => row.sweetness === "high";
      case "roundness":
        return (row: Pastry) => row.roundness === "high";
      case "topping":
        return (row: Pastry) => row.topping;
      case "filling":
        return (row: Pastry) => row.filling;
      default: {
        const neverFeature: never = feature;
        return (_row: Pastry) => Boolean(neverFeature);
      }
    }
  }

  function branchLabelsForFeature(feature: FeatureKey): { yes: string; no: string } {
    switch (feature) {
      case "sweetness":
        return { yes: "high", no: "not high" };
      case "roundness":
        return { yes: "high", no: "low" };
      case "topping":
        return { yes: "topping", no: "no topping" };
      case "filling":
        return { yes: "filling", no: "no filling" };
      default: {
        const neverFeature: never = feature;
        return { yes: String(neverFeature), no: "" };
      }
    }
  }

  type TreeNode = {
    id: NodeId;
    depth: number;
    rows: Pastry[];
    splitFeature?: FeatureKey;
    left?: TreeNode;
    right?: TreeNode;
  };

  const decisionTree = useMemo<TreeNode>(() => {
    function build(id: NodeId, depth: number, rows: Pastry[]): TreeNode {
      const splitFeature = splitsByNode[id];
      if (!splitFeature) return { id, depth, rows };

      const predicate = predicateForFeature(splitFeature);
      const leftRows: Pastry[] = [];
      const rightRows: Pastry[] = [];
      for (const row of rows) (predicate(row) ? leftRows : rightRows).push(row);

      const node: TreeNode = { id, depth, rows, splitFeature };
      if (leftRows.length > 0) node.left = build(`${id}L`, depth + 1, leftRows);
      if (rightRows.length > 0) node.right = build(`${id}R`, depth + 1, rightRows);
      return node;
    }

    return build(ROOT_ID, 0, dataset);
  }, [ROOT_ID, dataset, splitsByNode]);

  function TreeNodeView({ node }: { node: TreeNode }) {
    const gini = giniForRows(node.rows);
    const isSelected = node.id === selectedNodeId;

    if (!node.splitFeature) {
      return (
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setSelectedNodeId(node.id)}
            className={`border rounded bg-white px-3 py-2 text-center min-w-[12rem] hover:bg-gray-50 transition-colors ${
              isSelected ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <p className="text-sm font-semibold">Leaf</p>
            <p className="text-xs text-gray-600">Rows: {node.rows.length}</p>
            <p className="text-xs text-gray-600">Gini: {gini.toFixed(3)}</p>
          </button>
        </div>
      );
    }

    const split = splitByFeature.get(node.splitFeature);

    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setSelectedNodeId(node.id)}
          className={`border rounded bg-white px-3 py-2 text-center min-w-[12rem] hover:bg-gray-50 transition-colors ${
            isSelected ? "ring-2 ring-blue-400" : ""
          }`}
        >
          <p className="text-sm font-semibold">Split</p>
          <p className="text-xs text-gray-700">{split?.description ?? node.splitFeature}</p>
          <p className="text-xs text-gray-600">Rows: {node.rows.length}</p>
        </button>

        {node.left && node.right && (
          <>
            <div className="w-px h-4 bg-gray-300" />

            <div className="relative w-full">
              <div className="absolute left-0 right-0 top-0 h-px bg-gray-300" />
            </div>

            <div className="flex items-start justify-center gap-10 pt-4">
              <div className="flex flex-col items-center">
                <div className="text-[11px] text-gray-600 mb-1">
                  {branchLabelsForFeature(node.splitFeature).yes}
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <TreeNodeView node={node.left} />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[11px] text-gray-600 mb-1">
                  {branchLabelsForFeature(node.splitFeature).no}
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <TreeNodeView node={node.right} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  function collectLeaves(node: TreeNode): TreeNode[] {
    if (!node.splitFeature) return [node];
    const leaves: TreeNode[] = [];
    if (node.left) leaves.push(...collectLeaves(node.left));
    if (node.right) leaves.push(...collectLeaves(node.right));
    return leaves.length > 0 ? leaves : [node];
  }

  function findNode(node: TreeNode, id: NodeId): TreeNode | undefined {
    if (node.id === id) return node;
    if (node.left) {
      const found = findNode(node.left, id);
      if (found) return found;
    }
    if (node.right) {
      const found = findNode(node.right, id);
      if (found) return found;
    }
    return undefined;
  }

  function partitionRows(rows: Pastry[], feature: FeatureKey) {
    const predicate = predicateForFeature(feature);
    const left: Pastry[] = [];
    const right: Pastry[] = [];
    for (const row of rows) (predicate(row) ? left : right).push(row);
    return { left, right };
  }

  function giniAfterSplitForRows(rows: Pastry[], feature: FeatureKey) {
    if (rows.length === 0) return undefined;
    const { left, right } = partitionRows(rows, feature);
    if (left.length === 0 || right.length === 0) return undefined;
    return (left.length / rows.length) * giniForRows(left) + (right.length / rows.length) * giniForRows(right);
  }

  function weightedGiniForLeaves(leaves: TreeNode[]) {
    const total = leaves.reduce((sum, leaf) => sum + leaf.rows.length, 0);
    if (total === 0) return 0;
    return leaves.reduce((acc, leaf) => acc + (leaf.rows.length / total) * giniForRows(leaf.rows), 0);
  }

  function labelCounts(rows: Pastry[]) {
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.label, (counts.get(row.label) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }

  const leaves = useMemo(() => collectLeaves(decisionTree), [decisionTree]);
  const leafCount = leaves.length;
  const pureLeafCount = leaves.reduce((count, node) => (giniForRows(node.rows) === 0 ? count + 1 : count), 0);

  const completion = useMemo(() => {
    const eps = 1e-12;
    const remainingLeafIds: NodeId[] = [];

    for (const leaf of leaves) {
      const gini = giniForRows(leaf.rows);
      const isPure = gini <= eps;
      if (isPure) continue;

      let hasValidSplit = false;
      for (const candidate of splits) {
        if (giniAfterSplitForRows(leaf.rows, candidate.feature) !== undefined) {
          hasValidSplit = true;
          break;
        }
      }

      if (hasValidSplit) remainingLeafIds.push(leaf.id);
    }

    return {
      isComplete: remainingLeafIds.length === 0,
      remainingLeafIds,
    };
  }, [leaves, splits]);

  const selectedNode = useMemo(() => findNode(decisionTree, selectedNodeId), [decisionTree, selectedNodeId]);
  const selectedIsLeaf = Boolean(selectedNode && !selectedNode.splitFeature);
  const selectedGini = selectedNode ? giniForRows(selectedNode.rows) : 0;
  const treeWeightedGini = useMemo(() => weightedGiniForLeaves(leaves), [leaves]);

  const nodeGiniIfSplitSelectedByFeature = useMemo(() => {
    const map = new Map<FeatureKey, number>();
    if (!selectedNode || !selectedIsLeaf) return map;
    for (const candidate of splits) {
      const after = giniAfterSplitForRows(selectedNode.rows, candidate.feature);
      if (after === undefined) continue;
      map.set(candidate.feature, after);
    }
    return map;
  }, [selectedIsLeaf, selectedNode, splits]);

  const weightedGiniIfSplitSelectedByFeature = useMemo(() => {
    const map = new Map<FeatureKey, number>();
    if (!selectedNode || !selectedIsLeaf) return map;

    for (const candidate of splits) {
      const { left, right } = partitionRows(selectedNode.rows, candidate.feature);
      if (left.length === 0 || right.length === 0) continue;

      const simulatedLeaves: TreeNode[] = [];
      for (const leaf of leaves) {
        if (leaf.id !== selectedNode.id) {
          simulatedLeaves.push(leaf);
          continue;
        }
        simulatedLeaves.push({ id: `${leaf.id}L`, depth: leaf.depth + 1, rows: left });
        simulatedLeaves.push({ id: `${leaf.id}R`, depth: leaf.depth + 1, rows: right });
      }
      map.set(candidate.feature, weightedGiniForLeaves(simulatedLeaves));
    }

    return map;
  }, [leaves, selectedIsLeaf, selectedNode, splits]);

  function addSplitToSelected(feature: FeatureKey) {
    if (finished) return;
    if (!selectedNode) return;
    if (selectedNode.splitFeature) return;

    const { left, right } = partitionRows(selectedNode.rows, feature);
    if (left.length === 0 || right.length === 0) return;

    setSplitsByNode((prev) => ({ ...prev, [selectedNode.id]: feature }));
    setActions((prev) => [...prev, { nodeId: selectedNode.id, feature }]);
    setSelectedNodeId(`${selectedNode.id}L`);
  }

  function resetTree() {
    setSplitsByNode({});
    setSelectedNodeId(ROOT_ID);
    setActions([]);
    setFinished(false);
  }

  const evaluation = useMemo(() => {
    const eps = 1e-12;

    function buildTreeFrom(record: Record<NodeId, FeatureKey>) {
      function build(id: NodeId, depth: number, rows: Pastry[]): TreeNode {
        const splitFeature = record[id];
        if (!splitFeature) return { id, depth, rows };

        const predicate = predicateForFeature(splitFeature);
        const leftRows: Pastry[] = [];
        const rightRows: Pastry[] = [];
        for (const row of rows) (predicate(row) ? leftRows : rightRows).push(row);

        const node: TreeNode = { id, depth, rows, splitFeature };
        if (leftRows.length > 0) node.left = build(`${id}L`, depth + 1, leftRows);
        if (rightRows.length > 0) node.right = build(`${id}R`, depth + 1, rightRows);
        return node;
      }

      return build(ROOT_ID, 0, dataset);
    }

    let correctSteps = 0;
    const details: Array<{ nodeId: NodeId; chosen: FeatureKey; chosenAfter?: number; bestAfter?: number }> = [];

    const record: Record<NodeId, FeatureKey> = {};
    for (const action of actions) {
      const tree = buildTreeFrom(record);
      const node = findNode(tree, action.nodeId);
      if (!node || node.splitFeature) {
        details.push({ nodeId: action.nodeId, chosen: action.feature });
        continue;
      }

      const possible: number[] = [];
      for (const candidate of splits) {
        const after = giniAfterSplitForRows(node.rows, candidate.feature);
        if (after !== undefined) possible.push(after);
      }

      const bestAfter = possible.length > 0 ? Math.min(...possible) : undefined;
      const chosenAfter = giniAfterSplitForRows(node.rows, action.feature);

      if (bestAfter !== undefined && chosenAfter !== undefined && chosenAfter <= bestAfter + eps) {
        correctSteps += 1;
      }

      details.push({ nodeId: action.nodeId, chosen: action.feature, chosenAfter, bestAfter });
      record[action.nodeId] = action.feature;
    }

    return {
      correctSteps,
      totalSteps: actions.length,
      details,
    };
  }, [actions, dataset, splits]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Level 4: Choosing Splits with Gini Index</h1>
      <p className="text-gray-600 mb-6">
        Clank opens a flour-dusted basket of mixed pastries and sighs. Everything’s delicious, but nothing is organized.
        Your job is to teach Clank how to sort them: build a decision tree one choice at a time. Click a leaf to focus on
        that group, then pick the split that best separates the pastries. Tip: aim to minimize the Gini impurity at each step!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2 overflow-x-auto md:overflow-visible">
          <h2 className="font-semibold mb-2">Pastry Dataset</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left">id</th>
                <th className="px-2 py-1 text-left">sweetness</th>
                <th className="px-2 py-1 text-left">roundness</th>
                <th className="px-2 py-1 text-left">topping</th>
                <th className="px-2 py-1 text-left">filling</th>
                <th className="px-2 py-1 text-left">label</th>
              </tr>
            </thead>
            <tbody>
              {dataset.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-1">{row.id}</td>
                  <td className="px-2 py-1">{row.sweetness}</td>
                  <td className="px-2 py-1">{row.roundness}</td>
                  <td className="px-2 py-1">{row.topping ? "yes" : "no"}</td>
                  <td className="px-2 py-1">{row.filling ? "yes" : "no"}</td>
                  <td className="px-2 py-1 font-semibold">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Decision tree</h3>
            <p className="text-xs text-gray-600 mb-3">
              Updates live as you choose splits. Scroll sideways if needed.
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-max py-2">
                <TreeNodeView node={decisionTree} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Leaves: <span className="font-semibold">{leafCount}</span> • Pure leaves (Gini = 0):{" "}
              <span className="font-semibold">{pureLeafCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:col-span-1">
          <h2 className="font-semibold mb-2">Build Your Tree</h2>
          <p className="text-sm text-gray-500 mb-3">
            Click a leaf in the tree to select it, then choose a split to expand only that leaf.
          </p>

          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Selected node</p>
            {!selectedNode ? (
              <p className="text-sm text-gray-500">Select a node in the tree.</p>
            ) : (
              <div className="text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Rows:</span> {selectedNode.rows.length} • <span className="font-semibold">Gini:</span>{" "}
                  {selectedGini.toFixed(3)}
                </p>
                <p className="mt-2 font-semibold">Labels</p>
                <ul className="list-disc pl-5 text-xs text-gray-600">
                  {labelCounts(selectedNode.rows).map(([label, count]) => (
                    <li key={label}>
                      {label}: {count}
                    </li>
                  ))}
                </ul>
                {!selectedIsLeaf && <p className="mt-2 text-xs text-gray-500">Select a leaf to add a new split.</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {splits.map((split) => {
              const giniNext = weightedGiniIfSplitSelectedByFeature.get(split.feature);
              const nodeAfter = nodeGiniIfSplitSelectedByFeature.get(split.feature);
              const disabled = finished || !selectedNode || !selectedIsLeaf || nodeAfter === undefined;
              return (
                <button
                  key={split.feature}
                  type="button"
                  onClick={() => addSplitToSelected(split.feature)}
                  disabled={disabled}
                  className="border rounded p-3 text-left transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <p className="font-semibold">{split.description}</p>
                  <p className="text-sm">
                    Node Gini after split: <span className="font-semibold">{(nodeAfter ?? selectedGini).toFixed(3)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Tree weighted Gini after: <span className="font-semibold">{(giniNext ?? treeWeightedGini).toFixed(3)}</span>
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setFinished(true)}
              disabled={finished || actions.length === 0}
              className="border rounded px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
            >
              Finish
            </button>
            <button type="button" onClick={resetTree} className="border rounded px-4 py-2 hover:bg-gray-100">
              Reset
            </button>
          </div>

          {finished && (
            <div
              className={`mt-4 p-3 rounded border ${
                completion.isComplete ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
              }`}
            >
              <p className="font-semibold">Result</p>

              {!completion.isComplete ? (
                <>
                  <p className="text-sm mt-1">
                    Tree incomplete — keep splitting until all leaves are pure (Gini = 0) or no further split is possible.
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Remaining leaves to split: <span className="font-semibold">{completion.remainingLeafIds.length}</span>
                  </p>
                  <p className="text-sm red mt-1">Reset to try again.</p>
                </>
              ) : (
                <>
                  <p className="text-sm mt-1">
                    Lowest-impurity choices: <span className="font-semibold">{evaluation.correctSteps}</span> / {evaluation.totalSteps}
                  </p>
                  {evaluation.totalSteps > 0 && (
                    <ol className="mt-2 list-decimal pl-5 text-xs text-gray-700">
                      {evaluation.details.map((d, i) => (
                        <li key={`${d.nodeId}-${i}`}>
                          {d.nodeId}: {d.chosen}
                          {d.chosenAfter !== undefined && d.bestAfter !== undefined
                            ? ` (your gini ${d.chosenAfter.toFixed(3)}, best ${d.bestAfter.toFixed(3)})`
                            : ""}
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-4 p-3 rounded border bg-gray-50 border-gray-200">
            <p className="font-semibold">Tree status</p>
            <p className="text-sm mt-1">
              Weighted Gini: <span className="font-semibold">{treeWeightedGini.toFixed(3)}</span>
            </p>
            <p className="text-sm">
              Leaves: <span className="font-semibold">{leafCount}</span> • Pure leaves: <span className="font-semibold">{pureLeafCount}</span>
            </p>
          </div>
        </div>
        {finished && completion.isComplete && (
          <div className="md:col-start-1 md:row-start-2">
            <Link
              href="/?completed=true&level2Completed=true&level3Completed=true&level4Completed=true"
              className="brown-bg text-white px-4 py-2 rounded"
            >
              Go Back To Bakery
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
