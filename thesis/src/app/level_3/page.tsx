'use client';

import React, { useState } from "react";

// Level 3 - Decision Tree Prediction Puzzle for BakeML
export default function Level3BakeML() {
  type Row = {
    id: number;
    sweet: boolean;
    length: "long" | "short";
    round: boolean;
    _predicted?: string;
  };

  const initialData: Row[] = [
    { id: 1, sweet: true, length: "short", round: true },
    { id: 2, sweet: false, length: "long", round: true },
    { id: 3, sweet: true, length: "short", round: false },
    { id: 4, sweet: false, length: "short", round: false }
  ];

  const [data, setData] = useState<Row[]>(initialData);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const possiblePredictions = ["Donut", "Croissant", "Baguette", "Sandwich Bread"];

  function applyPrediction(rowId: number, prediction: string) {
    setData(prev => prev.map(r => r.id === rowId ? { ...r, _predicted: prediction } : r));
    setSelectedRow(null);
  }

  // Decision logic for correct prediction
  function getCorrectPrediction(row: Row): string {
    if (row.sweet && row.round && row.length === "short") return "Donut";
    if (row.sweet && !row.round && row.length === "short") return "Croissant";
    if (!row.sweet && row.round && row.length === "long") return "Baguette";
    if (!row.sweet && !row.round && row.length === "short") return "Sandwich Bread";
    // fallback
    return "Sandwich Bread";
  }

  // Check if all predictions are filled
  const allAnswered = data.every(row => row._predicted);

  // Compute correctness summary
  const correctCount = data.filter(row => row._predicted === getCorrectPrediction(row)).length;
  const totalCount = data.length;
  const accuracy = ((correctCount / totalCount) * 100).toFixed(1);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Level 3: Introduction to Decision Trees</h1>
      <p className="mb-4">Help Clank predict the type of each pastry. Click a row and pick the answer.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Table */}
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1">id</th>
                <th className="px-2 py-1">sweet</th>
                <th className="px-2 py-1">length</th>
                <th className="px-2 py-1">round</th>
                <th className="px-2 py-1">Prediction</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} onClick={() => setSelectedRow(row.id)} className={`border-t cursor-pointer transition-colors hover:bg-gray-100 ${selectedRow===row.id?'bg-yellow-100':''}` }>
                  <td className="px-2 py-1">{row.id}</td>
                  <td className="px-2 py-1">{row.sweet ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1">{row.length}</td>
                  <td className="px-2 py-1">{row.round ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1 font-semibold">{row._predicted || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!selectedRow && (
            <p className="text-sm text-gray-500 mt-2">Select a row to pick the prediction.</p>
          )}
          {selectedRow && (
            <>
              <p className="mb-2 mt-4">Pick the prediction for <strong>row {selectedRow}</strong>:</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {possiblePredictions.map(pred => (
                  <button
                    key={pred}
                    className="blue-bg text-white px-3 py-1 rounded"
                    onClick={() => applyPrediction(selectedRow, pred)}
                  >
                    {pred}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Decision Tree Panel */}
        <div className="bg-white rounded-lg shadow p-2">
          <h2 className="font-semibold mb-2">Decision Tree</h2>
          <div className="mb-4 text-left text-sm text-gray-700">
            <p><strong>Node:</strong> A point in the tree where a question is asked about the data (e.g., "Is it sweet?").</p>
            <p><strong>Branch:</strong> The path you follow from a node based on the answer (e.g., "Yes" or "No").</p>
            <p><strong>Leaf:</strong> The end point of a branch, where a final decision or prediction is made (e.g., "Donut").</p>
          </div>
          <img src="/decisiontree.png" alt="Decision Tree" width={800} height={600} />
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Tip: Use the decision tree image to help you pick the correct answer for each row.</p>
        {allAnswered && (
          <div className="mt-4">
            <p>
              Correct predictions: <strong>{correctCount}</strong> / {totalCount}
            </p>
            <p>
              Accuracy: <strong>{accuracy}%</strong>
            </p>
            {correctCount === totalCount
              ? <span className="text-green-700 font-bold">🎉 All predictions are correct! Well done!</span>
              : <span className="text-red-700 font-bold">Some predictions are incorrect. Try again!</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}