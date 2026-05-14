import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TX from '../assets/images/GuardianEye.svg';
import apiClient, { AUTH_STORAGE_KEYS } from '@/src/api/client';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing info', 'Please enter username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });
      const { access_token, role, user_id, driver_id } = response.data;

      await AsyncStorage.multiSet([
        [AUTH_STORAGE_KEYS.accessToken, access_token ?? ''],
        [AUTH_STORAGE_KEYS.role, role ?? ''],
        [AUTH_STORAGE_KEYS.userId, user_id ? String(user_id) : ''],
        [AUTH_STORAGE_KEYS.driverId, driver_id ? String(driver_id) : ''],
      ]);

      router.replace('/setup' as any);
    } catch (error: any) {
      console.log('Login failed', error?.response?.data ?? error?.message);
      Alert.alert('Login failed', 'Invalid username/password or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mt-12 mb-12">
            <TX width={220} height={60} />
          </View>

          <Text className="text-white text-2xl font-black mb-10 tracking-tight">Login</Text>

          <View>
            <InputGroup
              icon="person-outline"
              label="Username"
              value={username}
              onChangeText={setUsername}
              containerStyle={{ marginBottom: 24 }}
            />
            <InputGroup
              icon="lock-closed-outline"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-auto pt-16 items-center">
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isSubmitting}
              className="w-full bg-[#22C55E] py-5 rounded-[22px] items-center shadow-xl shadow-green-500/20"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-black text-lg tracking-widest uppercase">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-slate-600 mt-4 text-[10px] font-bold uppercase tracking-[3px] opacity-70">
              Đăng nhập để bắt đầu giám sát
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputGroup({
  icon,
  label,
  value,
  onChangeText,
  containerStyle,
  secureTextEntry = false,
}: any) {
  return (
    <View style={containerStyle}>
      <Text className="text-slate-500 text-[11px] font-bold uppercase mb-2.5 ml-1 tracking-wider">
        {label}
      </Text>
      <View className="bg-[#1A1A1A] p-4.5 rounded-[18px] flex-row items-center border border-slate-800/80">
        <View className="w-10 items-center justify-center">
          <Ionicons name={icon} size={22} color="#64748B" />
        </View>
        <TextInput
          className="flex-1 ml-2 text-white font-bold text-[16px]"
          placeholder={label}
          placeholderTextColor="#475569"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}
