import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import TX from '../assets/images/GuardianEye.svg';
import Logo from '../assets/images/Logo.svg';
import { AUTH_STORAGE_KEYS } from '@/src/api/client';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      const routeNext = async () => {
        const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
        router.replace((token ? '/setup' : '/login') as any);
      };
      void routeNext();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' }}>
      <StatusBar barStyle="light-content" />

      {/* --- PHẦN NỘI DUNG CHÍNH (Đẩy lên trên tâm) --- */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          alignItems: 'center',
          marginTop: height * 0.18, // Đẩy xuống 18% chiều cao màn hình để nằm trên tâm
          width: '100%'
        }}
      >

        {/* LOGO VÀ VÒNG TRÒN (Giữ nguyên cấu hình vòng tròn của Khôi) */}
        <View className="items-center justify-center">
          {/* Các vòng tròn đồng tâm mờ dần */}
          <Logo></Logo>
        </View>

        {/* TEXT GUARDIANEYE */}
        <View className="items-center mt-12">
          <View className="flex-row items-center">
            <View className="items-center mt-8 mb-10">
              <TX width={220} height={60} />
            </View>
          </View>
          <Text className="text-white text-[12px] mt-3 font-extralight tracking-[2px] uppercase">
            AI Powered Driver Monitoring
          </Text>
        </View>
      </Animated.View>

      {/* --- 3 DẤU CHẤM (To hơn, màu chuẩn Figma) --- */}
      <View className="absolute bottom-32 flex-row items-center justify-center gap-x-2">
        {/* Chấm 1: Đậm nhất (Trái) */}
        <View
          className="w-4 h-4 rounded-full bg-[#22C55E]"
          style={{
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10
          }}
        />

        {/* Chấm 2: Nhạt vừa (Giữa) */}
        <View className="w-4 h-4 rounded-full bg-[#22C55E]/40" />

        {/* Chấm 3: Nhạt nhất (Phải) */}
        <View className="w-4 h-4 rounded-full bg-[#22C55E]/10" />
      </View>

    </View>

  );
}