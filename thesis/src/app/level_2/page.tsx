'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    { id: 9, ingredient: "butter", amount: 300, type: "sweet" },
    { id: 10, ingredient: "water", amount: 500, type: "savory" },
    { id: 11, ingredient: "sugar", amount: 300, type: "sweet" },
  ];

  const [data, setData] = useState<Row[]>(initialData);
  const [actionsLeft, setActionsLeft] = useState(4);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ correct: number; total: number; accuracy: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!simulationResult) return;
    try {
      localStorage.setItem(
        "bakeml.level2.score",
        JSON.stringify({
          correct: simulationResult.correct,
          total: simulationResult.total,
          accuracy: simulationResult.accuracy,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore storage failures
    }
  }, [simulationResult?.correct, simulationResult?.total, simulationResult?.accuracy]);

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
              if (newRow.amount !== null && newRow.amount > 1000) newRow.amount = 1000;
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
    const activeRows = data.filter((row) => !row._removed);
    const total = activeRows.length;

    // Penalize duplicates unless the user removes them.
    // Duplicates are defined as rows with the same (ingredient, amount, type).
    const duplicateCounts = new Map<string, number>();
    for (const row of activeRows) {
      const key = `${row.ingredient}__${String(row.amount)}__${row.type}`;
      duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
    }

    let correct = 0;
    for (const row of activeRows) {
      const key = `${row.ingredient}__${String(row.amount)}__${row.type}`;
      const hasAmount = row.amount !== null;
      const inRange = row.amount !== null && row.amount <= 1000;
      const typeValid = row.type === "sweet" || row.type === "savory";
      const notDuplicate = (duplicateCounts.get(key) ?? 0) === 1;

      if (hasAmount && inRange && typeValid && notDuplicate) correct++;
    }

    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";
    setSimulationResult({ correct, total, accuracy });
  }

  return (
    <div className="relative p-6 max-w-5xl mx-auto overflow-visible">
      <h1 className="text-2xl font-bold mb-4">Level 2: Data-Cleaning Puzzle</h1>
      <p className="text-base text-gray-900">Help Clank clean the bakery dataset! You have <strong>{actionsLeft}</strong> actions left.</p>
      <div className="mb-4 mt-3 rounded-lg border-l-4 border-amber-500 bg-amber-100 px-4 py-3 text-sm text-gray-900 shadow-sm">
        <p><strong>Tip:</strong> Choose the fixes wisely! You only have a limited number of actions, and better cleaning increases Clank&apos;s prediction accuracy in the bakery simulation.</p>
        <p><strong>Note:</strong> This database contains duplicate entries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Table */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* optional: ensure horizontal overflow is handled on small screens */}
          <div className="overflow-x-auto">
           <table className="w-full table-auto border-collapse">
             <thead>
               <tr className="border-b">
                 <th className="px-2 py-1">id</th>
                 <th className="px-2 py-1">ingredient</th>
                 <th className="px-2 py-1">amount (in grams)</th>
                 <th className="px-2 py-1">type</th>
               </tr>
             </thead>
             <tbody>
               {data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row.id)}
                  className={
                    `border-t cursor-pointer transition-colors hover:bg-gray-100 ` +
                    `${selectedRow === row.id ? 'bg-yellow-100' : ''} ` +
                    `${row._removed ? 'line-through text-gray-400' : ''}`
                  }
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
        </div>

        {/* Fix Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Fix Actions</h2>
          {selectedRow && !simulationResult && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-800">
              <p className="font-semibold">Clank says: Quick hint before you start.</p>
              <p><strong>Fill Missing</strong>: Use when a value is absent.</p>
              <p><strong>Correct Label</strong>: Use when a category name looks suspicious/misspelled.</p>
              <p><strong>Remove Duplicate</strong>: Use when two rows represent the same record.</p>
              <p><strong>Trim Outlier</strong>: Use when one number is far outside the normal range.</p>
              <p className="mt-1 text-xs text-gray-600">Some actions may do nothing on certain rows, so choose carefully.</p>
            </div>
          )}
          {selectedRow ? (
            <div className="flex flex-col gap-2">
              <button className="blue-bg text-white px-3 py-1 rounded cursor-pointer" onClick={() => applyFix(selectedRow, 'fill_missing')}>Fill Missing</button>
              <button className="blue-bg text-white px-3 py-1 rounded cursor-pointer" onClick={() => applyFix(selectedRow, 'correct_label')}>Correct Label</button>
              <button className="blue-bg text-white px-3 py-1 rounded cursor-pointer" onClick={() => applyFix(selectedRow, 'remove_duplicate')}>Remove Duplicate</button>
              <button className="blue-bg text-white px-3 py-1 rounded cursor-pointer" onClick={() => applyFix(selectedRow, 'clamp_outlier')}>Trim Outlier</button>
            </div>
          ) : (
            <><p className="text-sm text-gray-500"><strong>Step 1: </strong>Select a row in the table to apply a fix.</p><p className="text-sm text-gray-500"><strong>Step 2: </strong>Select an action to apply to the selected row.</p></>
          )}

          <div className="mt-4">
            <button onClick={runSimulation} className="red-bg text-white px-3 py-1 rounded cursor-pointer">Run Simulation</button>
          </div>

          {simulationResult && (
            <div className="mt-4">
              <p>Cleaned Rows: {simulationResult.correct} / {simulationResult.total}</p>
              <p>Estimated Accuracy: {simulationResult.accuracy}%</p>
            </div>
          )}
        </div>
      </div>

      {!simulationResult && (
        <aside className="hidden xl:block absolute top-55 -right-56 pointer-events-none">
          <Image
            src="/robot_baker.png"
            alt="Clank the robot baker"
            width={260}
            height={260}
            className="shrink-0"
          />
        </aside>
      )}

      {simulationResult && (
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/?completed=true&level2Completed=true')}
            className="brown-bg text-white px-4 py-2 rounded"
          >
            Go to Level 3
          </button>
        </div>
      )}
    </div>
  );
}
