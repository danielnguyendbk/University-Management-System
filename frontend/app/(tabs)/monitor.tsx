import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { apiClient } from '../../src/api/client';

const BG = '#000000';
const CARD = '#1C1C1E';
const CARD_2 = '#161618';
const GREEN = '#4CD964';
const BLUE = '#3B82F6';
const ORANGE = '#FF9500';
const MUTED = '#8E8E93';
const DIVIDER = 'rgba(255,255,255,0.08)';

type Mode = 'day' | 'night';

type LiveStatus = 'NORMAL' | 'WARNING' | 'DROWSY' | 'DISTRACTED';
type LiveEventType = 'NORMAL' | 'EYES_CLOSED' | 'FACE_LOST' | 'EYES_LOST';

const DEFAULT_LIVE_EVENT = {
  status: 'NORMAL' as LiveStatus,
  eventType: 'NORMAL' as LiveEventType,
  alarm: false,
  message: 'No AI event yet',
  ear: null as number | null,
  drowsyTime: 0,
  noFaceTime: 0,
  sessionId: null as number | null,
  timestamp: null as string | null,
};

function GuardianEyeTitle() {
  return (
    <View style={styles.titleRow}>
      <Text style={styles.titleGuardian}>Guardian</Text>
      <Text style={styles.titleEye}>Eye</Text>
    </View>
  );
}

function CircularGauge({
  value,
  size = 76,
  strokeWidth = 7,
  color,
}: {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={styles.gaugeValue}>{value}</Text>
        <Text style={styles.gaugeSuffix}>/100</Text>
      </View>
    </View>
  );
}

export default function MonitorScreen() {
  const [mode, setMode] = useState<Mode>('day');
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [aiEvent, setAiEvent] = useState<any | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlarmVibrateTimeRef = useRef<number>(0);
  const isAlarmActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const normalizedEvent = useMemo(() => {
    const raw = aiEvent ?? DEFAULT_LIVE_EVENT;
    return {
      ...DEFAULT_LIVE_EVENT,
      ...raw,
      status: (raw.status ?? DEFAULT_LIVE_EVENT.status) as LiveStatus,
      eventType: (raw.eventType ?? DEFAULT_LIVE_EVENT.eventType) as LiveEventType,
      alarm: Boolean(raw.alarm),
      sessionId: raw.sessionId ?? sessionId,
    };
  }, [aiEvent, sessionId]);

  const bannerMeta = useMemo(() => {
    const status = normalizedEvent.status;
    const eventType = normalizedEvent.eventType;

    const eventMessageByType: Record<LiveEventType, string> = {
      NORMAL: 'Binh thuong',
      EYES_CLOSED: 'Mat nham tam thoi',
      FACE_LOST: 'Khong phat hien khuon mat',
      EYES_LOST: 'Khong phat hien mat',
    };

    if (status === 'NORMAL') {
      return {
        bannerType: 'safe' as const,
        bannerTitle: 'Binh thuong',
        bannerSub: normalizedEvent.message || 'Lai xe an toan',
      };
    }

    if (status === 'WARNING') {
      return {
        bannerType: 'warn' as const,
        bannerTitle: 'Canh bao nhe',
        bannerSub: eventMessageByType[eventType] || normalizedEvent.message || 'Canh bao nhe',
      };
    }

    if (status === 'DROWSY') {
      return {
        bannerType: 'warn' as const,
        bannerTitle: 'Canh bao buon ngu',
        bannerSub: normalizedEvent.message || 'Canh bao buon ngu',
      };
    }

    return {
      bannerType: 'warn' as const,
      bannerTitle: 'Mat tap trung',
      bannerSub: eventMessageByType[eventType] || normalizedEvent.message || 'Mat tap trung',
    };
  }, [normalizedEvent]);

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleAlarmState = (payload: any) => {
    const shouldAlarm = Boolean(payload?.alarm);
    const now = Date.now();

    if (shouldAlarm) {
      if (!isAlarmActiveRef.current || now - lastAlarmVibrateTimeRef.current >= 2000) {
        Vibration.vibrate([0, 500, 300, 500]);
        lastAlarmVibrateTimeRef.current = now;
      }
      if (!isAlarmActiveRef.current) {
        isAlarmActiveRef.current = true;
        setIsAlarmActive(true);
      }
      return;
    }

    if (isAlarmActiveRef.current) {
      Vibration.cancel();
      isAlarmActiveRef.current = false;
      setIsAlarmActive(false);
    }
  };

  const startPolling = (id: number) => {
    clearPolling();
    console.log('Start polling latest event every 500ms');
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiClient.get(`/api/events/session/${id}/live-latest`);
        const raw = response.data;
        const payload = raw?.data ? raw.data : raw;
        console.log('Polling latest event:', payload);
        setAiEvent(payload);
        handleAlarmState(payload);
      } catch (error) {
        console.log('Polling latest event error:', error);
      }
    }, 500);
  };

  const startMonitoring = async () => {
    try {
      const response = await apiClient.post('/api/sessions/start', { vehicle_id: 1 });
      console.log('Start monitoring response:', response.data);
      const nextSessionId =
        response.data?.id ??
        response.data?.data?.id ??
        response.data?.sessionId ??
        response.data?.session_id;

      if (!nextSessionId) {
        console.log('Start monitoring missing sessionId');
        return;
      }

      setSessionId(nextSessionId);
      setIsMonitoring(true);
      console.log('Using sessionId:', nextSessionId);
      startPolling(nextSessionId);
    } catch (error) {
      console.log('Start monitoring error:', error);
    }
  };

  const stopMonitoring = async () => {
    console.log('Stop polling');
    clearPolling();
    if (sessionId) {
      try {
        await apiClient.post(`/api/sessions/${sessionId}/stop`, {});
      } catch (error) {
        console.log('Stop monitoring error:', error);
      }
    }
    setSessionId(null);
    setIsMonitoring(false);
    setAiEvent(null);
    setIsAlarmActive(false);
    isAlarmActiveRef.current = false;
    Vibration.cancel();
  };

  const activeDotColor = isAlarmActive ? '#FF3B30' : GREEN;

  const data = useMemo(() => {
    if (mode === 'day') {
      return {
        modeLabel: 'Chế độ ban ngày',
        modeIcon: 'sunny-outline' as const,
        faceBorder: GREEN,
        facePct: 92,
        gauge: 92,
        gaugeColor: GREEN,
        bannerType: bannerMeta.bannerType,
        bannerTitle: bannerMeta.bannerTitle,
        bannerSub: bannerMeta.bannerSub,
        counterLeft: 1,
        counterRight: 2,
      };
    }

    return {
      modeLabel: 'Chế độ ban đêm',
      modeIcon: 'moon-outline' as const,
      faceBorder: '#3B5BDB',
      facePct: 68,
      gauge: 72,
      gaugeColor: ORANGE,
      bannerType: bannerMeta.bannerType,
      bannerTitle: bannerMeta.bannerTitle,
      bannerSub: bannerMeta.bannerSub,
      counterLeft: 3,
      counterRight: 1,
    };
  }, [bannerMeta, mode]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={12} accessibilityRole="button">
            <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
          </Pressable>
          <GuardianEyeTitle />
          <Pressable hitSlop={12} accessibilityRole="button">
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Camera / preview card */}
          <View style={styles.cameraCard}>
            <View style={styles.pillsRow}>
              <Pressable
                onPress={() => setMode((m) => (m === 'day' ? 'night' : 'day'))}
                style={styles.pill}
                accessibilityRole="button"
              >
                <Ionicons
                  name={data.modeIcon}
                  size={14}
                  color={MUTED}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.pillText}>{data.modeLabel}</Text>
              </Pressable>

              <View style={styles.pill}>
                <View style={[styles.activeDot, { backgroundColor: activeDotColor }]} />
                <Text style={styles.pillText}>{isMonitoring ? 'Dang giam sat' : 'Tam dung'}</Text>
              </View>

              <Pressable
                onPress={isMonitoring ? stopMonitoring : startMonitoring}
                style={[styles.pill, isMonitoring ? styles.pillStop : styles.pillStart]}
                accessibilityRole="button"
              >
                <Ionicons
                  name={isMonitoring ? 'stop-circle-outline' : 'play-circle-outline'}
                  size={14}
                  color={isMonitoring ? '#FF3B30' : GREEN}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.pillText}>{isMonitoring ? 'Dung giam sat' : 'Bat dau'}</Text>
              </Pressable>
            </View>

            <View style={styles.faceWrap}>
              <View style={[styles.faceBox, { borderColor: data.faceBorder }]} />
            </View>

            <Text style={styles.faceLabel}>Nhận diện khuôn mặt: {data.facePct}%</Text>
            <View style={styles.faceTrack}>
              <View style={[styles.faceFill, { width: `${data.facePct}%` }]} />
              <View style={styles.faceRest} />
            </View>
          </View>

          {/* Night-only auto light */}
          {mode === 'night' ? (
            <View style={styles.autoLightBanner}>
              <Ionicons name="flashlight-outline" size={18} color={BLUE} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.autoLightTitle}>Ánh sáng tự động: Đang bật</Text>
                <Text style={styles.autoLightSub}>Đang sử dụng ánh sáng từ tín hiệu</Text>
              </View>
            </View>
          ) : null}

          {/* Safety score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Điểm An Toàn</Text>
            <CircularGauge value={data.gauge} color={data.gaugeColor} />
          </View>

          {/* Indicators */}
          <View style={styles.indicatorCard}>
            <IndicatorRow icon="eye-outline" label="Mắt" value="MỞ" valueColor={GREEN} />
            <IndicatorRow icon="navigate-circle-outline" label="Hướng đầu" value="PHÍA TRƯỚC" valueColor={GREEN} />
            <IndicatorRow icon="car-outline" label="Trạng thái" value="ĐANG LÁI" valueColor={GREEN} />
            <IndicatorRow icon="speedometer-outline" label="Tốc độ" value="28 km/h" valueColor="#FFFFFF" isLast />
          </View>

          {/* Banner */}
          {data.bannerType === 'safe' ? (
            <Pressable style={styles.safeBanner} accessibilityRole="button">
              <View style={styles.bannerIconSafe}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitleSafe}>{data.bannerTitle}</Text>
                <Text style={styles.bannerSubSafe}>{data.bannerSub}</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={styles.warnBanner}
              accessibilityRole="button"
              onPress={() => router.push('/alerts/medium')}
            >
              <View style={styles.bannerIconWarn}>
                <Ionicons name="warning-outline" size={20} color="#2B1A00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitleWarn}>{data.bannerTitle}</Text>
                <Text style={styles.bannerSubWarn}>{data.bannerSub}</Text>
              </View>
            </Pressable>
          )}

          {/* Counters */}
          <View style={styles.counterCard}>
            <View style={[styles.counterCol, { borderRightColor: DIVIDER }]}>
              <Text style={styles.counterCaption}>Sự kiện buồn ngủ</Text>
              <View style={styles.counterBottomRow}>
                <Ionicons name="sad-outline" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
                <Text style={styles.counterNum}>{data.counterLeft}</Text>
              </View>
            </View>
            <View style={styles.counterColLast}>
              <Text style={styles.counterCaption}>Sự kiện mất tập trung</Text>
              <View style={styles.counterBottomRow}>
                <Ionicons name="body-outline" size={20} color={ORANGE} style={{ marginRight: 10 }} />
                <Text style={styles.counterNum}>{data.counterRight}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function IndicatorRow({
  icon,
  label,
  value,
  valueColor,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.indicatorRow, !isLast && styles.indicatorRowBorder]}>
      <View style={styles.indicatorLeft}>
        <Ionicons name={icon} size={18} color={GREEN} />
        <Text style={styles.indicatorLabel}>{label}</Text>
      </View>
      <View style={styles.indicatorRight}>
        <Text style={[styles.indicatorValue, { color: valueColor }]}>{value}</Text>
        <Ionicons name="checkmark-circle" size={18} color={GREEN} style={{ marginLeft: 10 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, backgroundColor: BG, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleGuardian: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  titleEye: { color: GREEN, fontSize: 20, fontWeight: '700' },
  body: { flex: 1, backgroundColor: BG },
  bodyContent: { paddingBottom: 24 },

  cameraCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  pillsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pillStart: {
    borderColor: 'rgba(76,217,100,0.5)',
  },
  pillStop: {
    borderColor: 'rgba(255,59,48,0.5)',
  },
  pillText: { color: '#C7C7CC', fontSize: 11, fontWeight: '600' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginRight: 8 },

  faceWrap: { alignItems: 'center', justifyContent: 'center', height: 170, marginTop: 8 },
  faceBox: {
    width: 92,
    height: 92,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  faceLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  faceTrack: {
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  faceFill: { height: '100%', backgroundColor: GREEN, borderRadius: 5 },
  faceRest: { flex: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.20)' },

  autoLightBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoLightTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  autoLightSub: { color: 'rgba(255,255,255,0.72)', fontSize: 10, marginTop: 2 },

  scoreCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  gaugeCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', lineHeight: 24 },
  gaugeSuffix: { color: MUTED, fontSize: 10, marginTop: 2 },

  indicatorCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  indicatorRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  indicatorLeft: { flexDirection: 'row', alignItems: 'center' },
  indicatorLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginLeft: 10 },
  indicatorRight: { flexDirection: 'row', alignItems: 'center' },
  indicatorValue: { fontSize: 12, fontWeight: '800' },

  safeBanner: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.25)',
  },
  warnBanner: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.26)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
  },
  bannerIconSafe: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerIconWarn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTitleSafe: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  bannerSubSafe: { color: 'rgba(255,255,255,0.80)', fontSize: 11, marginTop: 2 },
  bannerTitleWarn: { color: '#2B1A00', fontSize: 13, fontWeight: '900' },
  bannerSubWarn: { color: 'rgba(43,26,0,0.75)', fontSize: 11, marginTop: 2 },

  counterCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  counterCol: {
    flex: 1,
    paddingHorizontal: 14,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  counterColLast: { flex: 1, paddingHorizontal: 14 },
  counterCaption: { color: MUTED, fontSize: 11, fontWeight: '600' },
  counterBottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  counterNum: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
