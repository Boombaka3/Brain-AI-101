import React, { useState } from "react";

const INITIAL_INPUTS = [2, 3, 1, 0];
const INITIAL_THRESHOLD = 5;

// ----- Pure logic -----

function calculateTotal(inputs) {
  return inputs.reduce((sum, value) => sum + value, 0);
}

function neuronFires(totalInput, threshold) {
  return totalInput >= threshold;
}

// ----- View + state -----

export default function App() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [threshold, setThreshold] = useState(INITIAL_THRESHOLD);

  const totalInput = calculateTotal(inputs);
  const fires = neuronFires(totalInput, threshold);

  const handleInputChange = (index, newValue) => {
    const updated = inputs.map((value, i) =>
      i === index ? newValue : value
    );
    setInputs(updated);
  };

  const handleThresholdChange = (newValue) => {
    setThreshold(newValue);
  };

  const pageStyle = {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "24px",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: 1.4,
  };

  const panelStyle = {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "16px",
    backgroundColor: "#fafafa",
  };

  const sliderRowStyle = {
    marginBottom: "12px",
  };

  const labelRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "14px",
  };

  const sliderStyle = {
    width: "100%",
  };

  const summaryRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 600,
    marginTop: "8px",
  };

  const statusBoxStyle = {
    padding: "24px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: 700,
    color: fires ? "#ffffff" : "#333333",
    backgroundColor: fires ? "#e02424" : "#cbd5e1",
    border: fires ? "2px solid #7f1d1d" : "2px solid #64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const statusDetailStyle = {
    marginTop: "8px",
    fontSize: "14px",
    fontWeight: 400,
    textTransform: "none",
    letterSpacing: "normal",
  };

  return (
    <div style={pageStyle}>
      <h2>Single Neuron: Input, Threshold, and Firing</h2>

      <p style={{ marginBottom: "16px", fontSize: "14px" }}>
        Change the strength of each input and the threshold. All numbers are
        shown at all times. You can predict whether the neuron will fire, then
        check your prediction using the firing box below.
      </p>

      {/* Input sliders */}
      <section style={panelStyle}>
        <h3>Input signals</h3>
        <p style={{ fontSize: "13px", marginBottom: "12px" }}>
          Each slider controls one input signal. Higher numbers mean stronger
          input.
        </p>

        {inputs.map((value, index) => (
          <div key={index} style={sliderRowStyle}>
            <div style={labelRowStyle}>
              <span>Input {index + 1} strength</span>
              <span>Current value: {value}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={value}
              onChange={(e) =>
                handleInputChange(index, Number(e.target.value))
              }
              style={sliderStyle}
            />
          </div>
        ))}

        <div style={summaryRowStyle}>
          <span>Total input (all inputs added together)</span>
          <span>{totalInput}</span>
        </div>
      </section>

      {/* Threshold slider */}
      <section style={panelStyle}>
        <h3>Threshold (gate)</h3>
        <p style={{ fontSize: "13px", marginBottom: "12px" }}>
          The threshold is the gate level. If the total input is at least this
          number, the neuron fires. If the total input is lower, the neuron does
          not fire.
        </p>

        <div style={sliderRowStyle}>
          <div style={labelRowStyle}>
            <span>Threshold level</span>
            <span>Current value: {threshold}</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={threshold}
            onChange={(e) =>
              handleThresholdChange(Number(e.target.value))
            }
            style={sliderStyle}
          />
        </div>

        <div style={summaryRowStyle}>
          <span>Total input compared with threshold</span>
          <span>
            Total input: {totalInput} &nbsp; | &nbsp; Threshold: {threshold}
          </span>
        </div>
      </section>

      {/* Firing status */}
      <section>
        <div style={statusBoxStyle}>
          {fires ? "NEURON FIRES" : "NEURON DOES NOT FIRE"}
          <div style={statusDetailStyle}>
            Total input: {totalInput} &nbsp; | &nbsp; Threshold: {threshold}
            &nbsp; | &nbsp;
            {fires
              ? "Total input is equal to or above the threshold."
              : "Total input is below the threshold."}
          </div>
        </div>
      </section>
    </div>
  );
}


