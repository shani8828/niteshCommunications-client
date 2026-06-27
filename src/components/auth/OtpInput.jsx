import React, { useState, useRef, useEffect } from "react";

const OtpInput = ({ value, onChange }) => {
  const [values, setValues] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  // Auto-focus the first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Update internal state if the value prop changes from outside (e.g. reset)
  useEffect(() => {
    if (!value) {
      setValues(Array(6).fill(""));
    }
  }, [value]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newValues = [...values];
    // Take only the last digit entered
    const char = val.substring(val.length - 1);
    newValues[index] = char;
    setValues(newValues);

    const combinedOtp = newValues.join("");
    onChange(combinedOtp);

    // Auto focus next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newValues = [...values];
      if (!values[index] && index > 0) {
        // Clear previous input and move focus there
        newValues[index - 1] = "";
        setValues(newValues);
        onChange(newValues.join(""));
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        // Clear current input
        newValues[index] = "";
        setValues(newValues);
        onChange(newValues.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .substring(0, 6);

    if (data.length === 6) {
      const newValues = data.split("");
      setValues(newValues);
      onChange(data);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  return (
    <div className="flex gap-2.5 justify-center my-4" onPaste={handlePaste}>
      {values.map((val, idx) => (
        <input
          key={idx}
          type="text"
          maxLength="1"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          ref={(el) => (inputRefs.current[idx] = el)}
          value={val}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="w-12 h-12 text-center text-xl font-bold border border-slate-200 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-800 bg-white"
        />
      ))}
    </div>
  );
};

export default React.memo(OtpInput);
