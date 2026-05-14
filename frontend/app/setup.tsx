import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TX from '../assets/images/GuardianEye.svg';
import apiClient, { SESSION_STORAGE_KEYS } from '@/src/api/client';

type Vehicle = {
  id: number;
  name: string;
  plate_no: string;
  vehicle_type: string;
  status: string;
};

export default function VehicleSelectScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await apiClient.get('/api/vehicles/my-vehicles');
        const list = response.data ?? [];
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicleId(list[0].id);
        }
      } catch (error: any) {
        console.log('Failed to load vehicles', error?.response?.data ?? error?.message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadVehicles();
  }, []);

  const handleStartMonitoring = async () => {
    if (!selectedVehicleId) {
      Alert.alert('Select vehicle', 'Please choose a vehicle to start monitoring.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/sessions/start', {
        vehicle_id: selectedVehicleId,
      });
      const sessionId = response.data?.id;
      if (sessionId) {
        await AsyncStorage.setItem(SESSION_STORAGE_KEYS.activeSessionId, String(sessionId));
        router.replace({
          pathname: '/(tabs)/monitor',
          params: { sessionId: String(sessionId) },
        });
      } else {
        Alert.alert('Error', 'Failed to start session.');
      }
    } catch (error: any) {
      const responseData = error?.response?.data ?? error?.message;
      console.log('Failed to start session', responseData);
      if (error?.response?.status === 409) {
        const existingSessionId = await AsyncStorage.getItem(
          SESSION_STORAGE_KEYS.activeSessionId,
        );
        if (existingSessionId) {
          Alert.alert('Session running', 'Opening the current session.');
          router.replace({
            pathname: '/(tabs)/monitor',
            params: { sessionId: existingSessionId },
          });
          return;
        }
        Alert.alert('Session running', 'Driver already has an active session.');
      } else {
        Alert.alert('Error', 'Failed to start session.');
      }
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
          {/* --- BRANDING --- */}
          <View className="items-center mt-12 mb-12">
          {/* Gọi trực tiếp component Logo đã import */}
          <TX width={220} height={60} /> 
        </View>

          <Text className="text-white text-2xl font-black mb-10 tracking-tight">Select Vehicle</Text>

          <View>
            {isLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#22C55E" />
              </View>
            ) : vehicles.length === 0 ? (
              <Text className="text-slate-400">No vehicles found.</Text>
            ) : (
              vehicles.map((vehicle) => {
                const selected = vehicle.id === selectedVehicleId;
                return (
                  <TouchableOpacity
                    key={vehicle.id}
                    onPress={() => setSelectedVehicleId(vehicle.id)}
                    activeOpacity={0.8}
                    className={`mb-4 p-4 rounded-[18px] border ${
                      selected ? 'border-[#22C55E]' : 'border-slate-800/80'
                    } bg-[#1A1A1A]`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-white font-bold text-[16px]">
                          {vehicle.name}
                        </Text>
                        <Text className="text-slate-500 text-[12px] mt-1">
                          {vehicle.plate_no} • {vehicle.vehicle_type}
                        </Text>
                      </View>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* --- DEVICE STATUS CARD --- */}
          <View className="mt-12 bg-[#1A1A1A] p-6 rounded-[24px] border border-slate-800/60 flex-row items-center justify-between">
            <View>
              <Text className="text-slate-300 text-[14px] font-bold">Thiết bị đã sẵn sàng</Text>
              <Text className="text-slate-500 text-[11px] mt-1 font-medium italic">Camera, GPS và cảm biến</Text>
            </View>
            <Ionicons name="checkmark-circle" size={30} color="#22C55E" />
          </View>

          {/* --- START BUTTON --- */}
          <View className="mt-auto pt-16 items-center">
            <TouchableOpacity 
              onPress={handleStartMonitoring}
              activeOpacity={0.8}
              disabled={isSubmitting}
              className="w-full bg-[#22C55E] py-5 rounded-[22px] items-center shadow-xl shadow-green-500/20"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-black text-lg tracking-widest uppercase">
                  START MONITORING
                </Text>
              )}
            </TouchableOpacity>
            
            <Text className="text-slate-600 mt-4 text-[10px] font-bold uppercase tracking-[3px] opacity-70">
              Bấm để bắt đầu giám sát
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}