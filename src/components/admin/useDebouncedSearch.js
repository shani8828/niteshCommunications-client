import { useEffect, useRef, useState } from "react";

/**
 * Local search-box state that reports to the server-side query only after the
 * admin stops typing, so each keystroke doesn't trigger a request.
 */
const useDebouncedSearch = (committedValue, onCommit, delay = 350) => {
  const [value, setValue] = useState(committedValue || "");
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (value === (committedValue || "")) return undefined;
    const timer = setTimeout(() => onCommitRef.current(value), delay);
    return () => clearTimeout(timer);
  }, [value, committedValue, delay]);

  return [value, setValue];
};

export default useDebouncedSearch;
