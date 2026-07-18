import { useState, useEffect, useRef } from "react";

export default function useLeavingItems(currentItems, idFn) {
  const [leaving, setLeaving] = useState([]);
  const prev = useRef(null);

  useEffect(() => {
    const prevItems = prev.current;
    if (prevItems) {
      const prevIds = new Set(prevItems.map(idFn));
      const currIds = new Set(currentItems.map(idFn));
      const left = prevItems.filter((i) => !currIds.has(idFn(i)));
      if (left.length > 0) {
        setLeaving(left);
        const timer = setTimeout(() => setLeaving([]), 300);
        prev.current = currentItems;
        return () => clearTimeout(timer);
      }
    }
    prev.current = currentItems;
  }, [currentItems, idFn]);

  return leaving;
}
