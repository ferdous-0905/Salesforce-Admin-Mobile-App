import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "./primitives";
import { colors, styles as s } from "./theme";

interface Props {
  title: string;
  summary?: string;
  icon?: IconName;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Collapsing hides content without discarding drafts or a selected resource tab. */
export function Disclosure({
  title,
  summary,
  icon,
  children,
  open,
  onOpenChange,
}: Props) {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = open ?? localOpen;
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 18,
        backgroundColor: colors.surface,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        onPress={() => {
          setLocalOpen(!expanded);
          onOpenChange?.(!expanded);
        }}
        style={({ pressed }) => ({
          minHeight: 64,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {icon && <Icon name={icon} color={colors.teal} />}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.label}>{title}</Text>
          {!!summary && !expanded && <Text style={s.small}>{summary}</Text>}
        </View>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <Icon name="down" size={18} color={colors.muted} />
        </View>
      </Pressable>
      <View
        style={{
          display: expanded ? "flex" : "none",
          padding: 16,
          paddingTop: 0,
          gap: 16,
        }}
        aria-hidden={!expanded}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      >
        {children}
      </View>
    </View>
  );
}
