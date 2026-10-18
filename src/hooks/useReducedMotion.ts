import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo } from "react-native";
const ReducedMotionContext = createContext(true);
/** One OS subscription serves all animated controls. Start conservatively until it resolves. */
export function MotionPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduced(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return createElement(
    ReducedMotionContext.Provider,
    { value: reduced },
    children,
  );
}
export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}
