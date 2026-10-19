import React, { forwardRef } from "react";
import { ScrollView, View } from "react-native";
import { Motion } from "./primitives";
import { styles } from "./theme";
/** Inactive hosts stay mounted so native scroll offsets and child state are retained. */
export const ScreenHost = forwardRef<
  ScrollView,
  { active: boolean; children: React.ReactNode }
>(function ScreenHost({ active, children }, ref) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: active ? 1 : 0,
        zIndex: active ? 1 : 0,
      }}
      pointerEvents={active ? "auto" : "none"}
      aria-hidden={!active}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
    >
      <ScrollView
        ref={ref}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Motion active={active} style={{ gap: 20 }}>
          {children}
        </Motion>
      </ScrollView>
    </View>
  );
});
