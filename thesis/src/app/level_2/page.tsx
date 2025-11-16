'use client';

import React, { useState } from "react";

// Level 2 - Data-Cleaning Puzzle for BakeML
export default function Level2BakeML() {
  type Row = {
    id: number;
    ingredient: string;
    amount: number | null;
    type: string;
    _removed?: boolean;
  };

  const initialData: Row[] = [
    { id: 1, ingredient: "flour", amount: 500, type: "sweet" },
    { id: 2, ingredient: "sugar", amount: null, type: "savory" },
    { id: 3, ingredient: "butter", amount: 200, type: "savory" },
    { id: 4, ingredient: "flour", amount: 500, type: "savory" },
    { id: 5, ingredient: "sugar", amount: 100, type: "sweet" },
    { id: 6, ingredient: "butter", amount: 200, type: "savory" },
    { id: 7, ingredient: "flour", amount: 5000, type: "sweet" }, // outlier
    { id: 8, ingredient: "sugar", amount: 200, type: "swwet" }, // mislabeled
    { id: 9, ingredient: "butter", amount: 200, type: "savory" },
    { id: 10, ingredient: "water", amount: 500, type: "savory" },
    { id: 11, ingredient: "sugar", amount: 300, type: "sweet" },
  ];

  const [data, setData] = useState<Row[]>(initialData);
  const [actionsLeft, setActionsLeft] = useState(5);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ correct: number; total: number; accuracy: string } | null>(null);

  function applyFix(rowId: number, fixType: string) {
    if (actionsLeft <= 0) return;

    setData((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const newRow = { ...row };
          switch (fixType) {
            case "fill_missing":
              if (newRow.amount === null) newRow.amount = 100; // arbitrary fill
              break;
            case "correct_label":
              if (newRow.type === "swwet") newRow.type = "sweet";
              break;
            case "remove_duplicate":
              // mark row as removed by nulling it
              newRow._removed = true;
              break;
            case "clamp_outlier":
              if (newRow.amount !== null && newRow.amount > 1000) newRow.amount = 500;
              break;
            default:
              break;
          }
          return newRow;
        } else return row;
      })
    );

    setActionsLeft((prev) => prev - 1);
    setSelectedRow(null);
  }

  function runSimulation() {
    // Very simple "model accuracy" simulation based on data cleanliness
    const total = data.filter((row) => !row._removed).length;
    let correct = 0;
    data.forEach((row) => {
      if (row._removed) return;
      if (row.amount !== null && row.type === (row.type === "swwet" ? "sweet" : row.type) && row.amount <= 1000) correct++;
    });
    const accuracy = ((correct / total) * 100).toFixed(1);
    setSimulationResult({ correct, total, accuracy });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">BakeML — Level 2: Data-Cleaning Puzzle</h1>
      <p className="mb-4">Help Clank clean the bakery dataset! You have <strong>{actionsLeft}</strong> actions left.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Table */}
        <div>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1">id</th>
                <th className="px-2 py-1">ingredient</th>
                <th className="px-2 py-1">amount</th>
                <th className="px-2 py-1">type</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t cursor-pointer ${selectedRow === row.id ? 'bg-yellow-100' : ''} ${row._removed ? 'line-through text-gray-400' : ''}`}
                  onClick={() => setSelectedRow(row.id)}
                >
                  <td className="px-2 py-1">{row.id}</td>
                  <td className="px-2 py-1">{row.ingredient}</td>
                  <td className="px-2 py-1">{row.amount !== null ? row.amount : 'NULL'}</td>
                  <td className="px-2 py-1">{row.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fix Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Fix Actions</h2>
          {selectedRow ? (
            <div className="flex flex-col gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => applyFix(selectedRow, 'fill_missing')}>Fill Missing</button>
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => applyFix(selectedRow, 'correct_label')}>Correct Label</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => applyFix(selectedRow, 'remove_duplicate')}>Remove Duplicate</button>
              <button className="bg-yellow-500 text-black px-3 py-1 rounded" onClick={() => applyFix(selectedRow, 'clamp_outlier')}>Clamp Outlier</button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a row in the table to apply a fix.</p>
          )}

          <div className="mt-4">
            <button onClick={runSimulation} className="bg-purple-600 text-white px-3 py-1 rounded">Run Simulation</button>
          </div>

          {simulationResult && (
            <div className="mt-4">
              <p>Cleaned Rows: {simulationResult.correct} / {simulationResult.total}</p>
              <p>Estimated Accuracy: {simulationResult.accuracy}%</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Tip: Choose the fixes wisely! You only have a limited number of actions, and better cleaning increases Clank&apos;s prediction accuracy in the bakery simulation.</p>
      </div>
    </div>
  );
}
