import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Switch,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { usePrayer, PrayerSettings } from "@/context/PrayerContext";
import { PRAYER_ORDER, PRAYER_ARABIC, PRAYER_DISPLAY } from "@/hooks/useNextPrayer";

function TimeInput({
  label,
  value,
  onSave,
  color,
}: {
  label: string;
  value: string;
  onSave: (val: string) => void;
  color: string;
}) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  function handleSubmit() {
    const trimmed = text.trim();
    const parts = trimmed.split(":");
    const h = parseInt(parts[0] ?? "0", 10);
    const m = parseInt(parts[1] ?? "0", 10);

    if (
      isNaN(h) ||
      isNaN(m) ||
      h < 0 ||
      h > 23 ||
      m < 0 ||
      m > 59 ||
      parts.length !== 2
    ) {
      Alert.alert(
        "Invalid Time",
        "Please enter time in HH:MM format (24-hour), e.g. 05:15 or 13:30"
      );
      setText(value);
      setEditing(false);
      return;
    }

    const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onSave(formatted);
    setText(formatted);
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={styles.timeInputRow}>
      <Text style={[styles.timeInputLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {editing ? (
        <TextInput
          style={[
            styles.timeInputField,
            {
              color: color,
              borderColor: color,
              backgroundColor: colors.card,
            },
          ]}
          value={text}
          onChangeText={setText}
          onBlur={handleSubmit}
          onSubmitEditing={handleSubmit}
          autoFocus
          keyboardType="numbers-and-punctuation"
          placeholder="HH:MM"
          placeholderTextColor={colors.mutedForeground}
          maxLength={5}
          selectTextOnFocus
        />
      ) : (
        <TouchableOpacity
          onPress={() => {
            setEditing(true);
            Haptics.selectionAsync();
          }}
          style={[
            styles.timeDisplay,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.timeDisplayText, { color: color }]}>
            {value}
          </Text>
          <Feather name="edit-2" size={13} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function PrayerCard({
  prayerKey,
}: {
  prayerKey: (typeof PRAYER_ORDER)[number];
}) {
  const colors = useColors();
  const { settings, updatePrayerTime } = usePrayer();
  const pt = settings.prayerTimes[prayerKey];

  return (
    <View
      style={[
        styles.prayerCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.prayerCardHeader}>
        <Text style={[styles.prayerArabicCard, { color: colors.primary }]}>
          {PRAYER_ARABIC[prayerKey]}
        </Text>
        <Text style={[styles.prayerEnglishCard, { color: colors.foreground }]}>
          {PRAYER_DISPLAY[prayerKey]}
        </Text>
      </View>
      <View style={styles.prayerCardTimes}>
        <TimeInput
          label="Adhan"
          value={pt.adhan}
          color={colors.foreground}
          onSave={(v) => updatePrayerTime(prayerKey, "adhan", v)}
        />
        <TimeInput
          label="Iqama"
          value={pt.iqama}
          color={colors.accent}
          onSave={(v) => updatePrayerTime(prayerKey, "iqama", v)}
        />
      </View>
    </View>
  );
}

function TextSettingRow({
  label,
  value,
  onSave,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const colors = useColors();
  const [text, setText] = useState(value);

  function handleBlur() {
    if (text.trim() !== value) {
      onSave(text.trim() || value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  return (
    <View style={styles.textSettingRow}>
      <Text style={[styles.textSettingLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.textSettingInput,
          {
            color: colors.foreground,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="done"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings } = usePrayer();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function saveSetting(key: keyof PrayerSettings, value: unknown) {
    await updateSettings({ ...settings, [key]: value });
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 4,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
          Customise prayer times
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Mosque
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextSettingRow
            label="Mosque Name"
            value={settings.mosqueName}
            onSave={(v) => saveSetting("mosqueName", v)}
            placeholder="e.g. Jamiya Masjid"
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <TextSettingRow
            label="Arabic Name"
            value={settings.mosqueNameArabic}
            onSave={(v) => saveSetting("mosqueNameArabic", v)}
            placeholder="Arabic name"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Prayer Times
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          Tap any time to edit it. Use 24-hour format (e.g. 13:30 for 1:30 PM)
        </Text>

        {PRAYER_ORDER.map((key) => (
          <PrayerCard key={key} prayerKey={key} />
        ))}

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Additional
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.foreground }]}>
              Show Sunrise Time
            </Text>
            <Switch
              value={settings.showSunrise}
              onValueChange={(v) => saveSetting("showSunrise", v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {settings.showSunrise && (
            <>
              <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              <TimeInput
                label="Sunrise"
                value={settings.sunriseTime}
                color={colors.foreground}
                onSave={(v) => saveSetting("sunriseTime", v)}
              />
            </>
          )}
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <TimeInput
            label="Jumu'ah (Friday)"
            value={settings.jumuahTime}
            color={colors.foreground}
            onSave={(v) => saveSetting("jumuahTime", v)}
          />
        </View>

        <View
          style={[styles.infoCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" }]}
        >
          <Feather name="info" size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Changes are saved automatically. This settings screen can be accessed from any phone or tablet by visiting your app link.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  textSettingRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  textSettingLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  textSettingInput: {
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  prayerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  prayerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  prayerArabicCard: {
    fontSize: 22,
    fontWeight: "700",
  },
  prayerEnglishCard: {
    fontSize: 16,
    fontWeight: "600",
  },
  prayerCardTimes: {
    flexDirection: "row",
    gap: 12,
  },
  timeInputRow: {
    flex: 1,
    gap: 4,
  },
  timeInputLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeDisplayText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timeInputField: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
