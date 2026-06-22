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
import { router } from "expo-router";
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
          <Feather name="edit-2" size={18} color={colors.mutedForeground} />
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
        <View style={styles.prayerCardRow}>
          <TimeInput
            label="Awal"
            value={pt.awalWaqth}
            color="#4ADE80"
            onSave={(v) => updatePrayerTime(prayerKey, "awalWaqth", v)}
          />
          <TimeInput
            label="Adhaan"
            value={pt.adhan}
            color={colors.foreground}
            onSave={(v) => updatePrayerTime(prayerKey, "adhan", v)}
          />
        </View>
        <View style={[styles.rowDivider, { backgroundColor: colors.border, marginVertical: 8 }]} />
        <View style={styles.prayerCardRow}>
          <TimeInput
            label="Aaqri"
            value={pt.aaqriWaqth}
            color="#FB923C"
            onSave={(v) => updatePrayerTime(prayerKey, "aaqriWaqth", v)}
          />
          <TimeInput
            label="Iqama"
            value={pt.iqama}
            color="#60A5FA"
            onSave={(v) => updatePrayerTime(prayerKey, "iqama", v)}
          />
        </View>
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
  const { settings, updateSettings } = usePrayer();
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importJson, setImportJson] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function saveSetting(key: keyof PrayerSettings, value: unknown) {
    await updateSettings({ ...settings, [key]: value });
  }

  async function handleImportSubmit() {
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error("Data must be an array");

      await saveSetting("yearlyData", parsed);
      setImportModalVisible(false);
      setImportJson("");
      Alert.alert("Success", "Lifetime schedule imported successfully.");
    } catch (e) {
      Alert.alert("Error", "Invalid JSON format. Please check your data.");
    }
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
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Feather name="arrow-left" size={28} color={colors.foreground} />
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
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <View style={styles.hijriAdjustRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Hijri Date Adjustment
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                Adjust ±1 day to match local moon sighting
              </Text>
            </View>
            <View style={styles.hijriAdjustBtns}>
              {[-1, 0, 1].map((val) => {
                const isActive = (settings.hijriAdjustment ?? 0) === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.hijriAdjustBtn,
                      {
                        backgroundColor: isActive ? colors.primary : colors.card,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      saveSetting("hijriAdjustment", val);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  >
                    <Text
                      style={[
                        styles.hijriAdjustBtnText,
                        { color: isActive ? "#fff" : colors.foreground },
                      ]}
                    >
                      {val > 0 ? `+${val}` : String(val)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View
          style={[styles.infoCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" }]}
        >
          <Feather name="info" size={20} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Changes are saved automatically. This settings screen can be accessed from any phone or tablet by visiting your app link.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          System
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
        </View>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Lifetime Schedule
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Enable Lifetime Schedule
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                Automatically change times every day based on the calendar.
              </Text>
            </View>
            <Switch
              value={settings.useYearlyData}
              onValueChange={(v) => saveSetting("useYearlyData", v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={[styles.importBtn, { backgroundColor: colors.primary + "10" }]}
            onPress={() => {
              // We'll show an alert first
              Alert.alert(
                "Import Data",
                "Please paste the Lifetime JSON data here. This will update the mosque's yearly schedule for all TVs.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Import",
                    onPress: () => {
                      // In a real app, we'd use a clipboard or file picker
                      // For now, I'll add a state for an import modal or similar
                      setImportModalVisible(true);
                    }
                  }
                ]
              );
            }}
          >
            <Feather name="download" size={18} color={colors.primary} />
            <Text style={[styles.importBtnText, { color: colors.primary }]}>
              {settings.yearlyData ? "Update Yearly Data" : "Import Yearly Data"}
            </Text>
          </TouchableOpacity>

          {settings.yearlyData && (
            <View style={styles.statusRow}>
              <Feather name="check-circle" size={14} color="#4ADE80" />
              <Text style={{ fontSize: 12, color: "#4ADE80", marginLeft: 4 }}>
                {settings.yearlyData.length} days of data loaded
              </Text>
            </View>
          )}
        </View>

        {importModalVisible && (
          <View style={[styles.importContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Paste Lifetime JSON</Text>
            <TextInput
              multiline
              style={[styles.importInput, { color: colors.foreground, borderColor: colors.border }]}
              placeholder='[ { "Date": "2024-01-01", ... }, ... ]'
              placeholderTextColor={colors.mutedForeground}
              onChangeText={setImportJson}
              value={importJson}
            />
            <View style={styles.importActions}>
              <TouchableOpacity onPress={() => setImportModalVisible(false)} style={styles.actionBtn}>
                <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleImportSubmit}
                style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: 6 }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
    gap: 0,
  },
  prayerCardRow: {
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
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 8,
  },
  importBtnText: {
    fontWeight: "600",
    fontSize: 15,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },
  importContainer: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  importInput: {
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    textAlignVertical: "top",
  },
  importActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  hijriAdjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hijriAdjustBtns: {
    flexDirection: "row",
    gap: 8,
  },
  hijriAdjustBtn: {
    width: 44,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  hijriAdjustBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
