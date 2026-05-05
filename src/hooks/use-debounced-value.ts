import { useEffect, useState } from "react"

// Renvoie `value` après `delay` ms sans changement.
// Utile pour pas spam une API à chaque touche tapée.
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
