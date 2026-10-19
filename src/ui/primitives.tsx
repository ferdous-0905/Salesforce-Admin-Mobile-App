import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import BookOpen from "lucide-react-native/icons/book-open";
import ChartNoAxesCombined from "lucide-react-native/icons/chart-no-axes-combined";
import Settings2 from "lucide-react-native/icons/settings-2";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";
import Volume2 from "lucide-react-native/icons/volume-2";
import Mic from "lucide-react-native/icons/mic";
import Square from "lucide-react-native/icons/square";
import Check from "lucide-react-native/icons/check";
import Download from "lucide-react-native/icons/download";
import Upload from "lucide-react-native/icons/upload";
import Save from "lucide-react-native/icons/save";
import Trash2 from "lucide-react-native/icons/trash";
import ImageIcon from "lucide-react-native/icons/image";
import Play from "lucide-react-native/icons/play";
import FileText from "lucide-react-native/icons/file-text";
import ExternalLink from "lucide-react-native/icons/external-link";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import Maximize2 from "lucide-react-native/icons/maximize-2";
import Minimize2 from "lucide-react-native/icons/minimize-2";
import X from "lucide-react-native/icons/x";
import Sparkles from "lucide-react-native/icons/sparkles";
import Leaf from "lucide-react-native/icons/leaf";
import Target from "lucide-react-native/icons/target";
import House from "lucide-react-native/icons/house";
import type { LucideIcon } from "lucide-react-native";
import { colors, styles as s, toneColors, type Tone } from "./theme";
import { useReducedMotion } from "../hooks/useReducedMotion";
export const icons = {
  book: BookOpen,
  progress: ChartNoAxesCombined,
  settings: Settings2,
  next: ArrowRight,
  previous: ArrowLeft,
  review: RotateCcw,
  speaker: Volume2,
  mic: Mic,
  stop: Square,
  check: Check,
  download: Download,
  upload: Upload,
  save: Save,
  delete: Trash2,
  image: ImageIcon,
  play: Play,
  notes: FileText,
  external: ExternalLink,
  down: ChevronDown,
  enlarge: Maximize2,
  shrink: Minimize2,
  close: X,
  spark: Sparkles,
  leaf: Leaf,
  target: Target,
  home: House,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 20,
  color = colors.forest,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const Symbol: LucideIcon = icons[name];
  return (
    <Symbol size={size} color={color} strokeWidth={1.8} accessible={false} />
  );
}
export function IconBadge({
  name,
  tone = "forest",
}: {
  name: IconName;
  tone?: Tone;
}) {
  return (
    <View
      style={{
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: toneColors[tone].background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={name} color={toneColors[tone].ink} size={23} />
    </View>
  );
}
export function Motion({
  children,
  active = true,
  style,
}: {
  children: React.ReactNode;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (!active || reduced) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [active, reduced, progress]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [9, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
  icon = "next",
  tone = "forest",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  icon?: IconName;
  tone?: Tone;
}) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const palette = toneColors[tone];
  function press(to: number) {
    scale.stopAnimation();
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 35,
      bounciness: 2,
    }).start();
  }
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => press(0.975)}
        onPressOut={() => press(1)}
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: 16,
          paddingVertical: 15,
          paddingHorizontal: 18,
          backgroundColor: secondary ? palette.background : palette.ink,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        })}
      >
        <Icon name={icon} color={secondary ? palette.ink : "#fff"} />
        <Text
          style={{
            color: secondary ? palette.ink : "#fff",
            fontSize: 15,
            fontWeight: "700",
            flexShrink: 1,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
export function Card({
  children,
  tone,
  style,
}: {
  children: React.ReactNode;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        s.card,
        tone && {
          backgroundColor: toneColors[tone].background,
          borderColor: "transparent",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function NavigationTab({
  label,
  icon,
  tone,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  icon: IconName;
  tone: Tone;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  const emphasis = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    emphasis.stopAnimation();
    if (reduced) {
      emphasis.setValue(selected ? 1 : 0);
      return;
    }
    const animation = Animated.spring(emphasis, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 3,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, reduced, emphasis]);
  const palette = toneColors[tone];
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.tab, selected && { backgroundColor: palette.background }]}
    >
      <Animated.View
        style={{
          alignItems: "center",
          gap: 5,
          transform: [
            {
              translateY: emphasis.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -2],
              }),
            },
          ],
        }}
      >
        <Icon
          name={icon}
          color={selected ? palette.ink : colors.muted}
          size={23}
        />
        <Text
          style={[
            s.tabLabel,
            selected && { color: palette.ink, fontWeight: "800" },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
