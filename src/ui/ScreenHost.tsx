import React, { forwardRef, memo } from "react";
import { ScrollView, View } from "react-native";
import { styles } from "./theme";

interface ScreenHostProps {
  active: boolean;
  children: React.ReactNode;
  scrollable?: boolean;
}

/** Keep scroll offsets and child state; reveal tabs without replaying entrance motion. */
export const ScreenHost = forwardRef<ScrollView, ScreenHostProps>(function ScreenHost(
  { active, children, scrollable = true }, ref,
) {
  return (
    <View
      style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        opacity: active ? 1 : 0,
        zIndex: active ? 1 : 0,
      }}
      pointerEvents={active ? "auto" : "none"}
      aria-hidden={!active}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
    >
      <RetainedContent active={active}>
        {scrollable ? (
          <ScrollView
            ref={ref}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 20 }}>{children}</View>
          </ScrollView>
        ) : children}
      </RetainedContent>
    </View>
  );
});

// Update once when hiding so media stops, then leave hidden screen props alone.
// React state inside each screen stays mounted and remains available on return.
const RetainedContent = memo(function RetainedContent({ children }: {
  active: boolean;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}, (previous, next) => !previous.active && !next.active);
