import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Animated, ActivityIndicator, Alert, Linking 
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Network from 'expo-network';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // متغیر شمارنده
  const [counter, setCounter] = useState(0.00);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // افکت مربوط به اجرای شمارنده
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => prev + 0.01);
    }, 60000); // 60000 میلی‌ثانیه = 1 دقیقه

    return () => clearInterval(timer); // پاکسازی تایمر هنگام خروج از صفحه
  }, []);

  // افکت مربوط به بررسی شبکه و مخاطبین
  useEffect(() => {
    checkNetworkAndFetch();
  }, []);

  const checkNetworkAndFetch = async () => {
    setLoading(true);
    const networkState = await Network.getNetworkStateAsync();
    setIsConnected(networkState.isConnected);

    if (!networkState.isConnected) {
      setLoading(false);
      return; 
    }

    requestContactsPermission();
  };

  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        setContacts(data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    }
    setLoading(false);
  };

  const handleRetryPermission = async () => {
    const { status } = await Contacts.getPermissionsAsync();
    if (status === 'denied' || status === 'undetermined') {
      Alert.alert(
        "نیاز به دسترسی",
        "برای نمایش مخاطبین، لطفا از تنظیمات گوشی دسترسی را فعال کنید.",
        [
          { text: "انصراف", style: "cancel" },
          { text: "باز کردن تنظیمات", onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      requestContactsPermission();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>
          {item.phoneNumbers ? item.phoneNumbers[0].number : 'بدون شماره'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ed1944" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.center}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>اینترنت قطع است!</Text>
          <Text style={styles.errorSub}>لطفاً اتصال خود را بررسی کنید.</Text>
          <TouchableOpacity style={styles.button} onPress={checkNetworkAndFetch}>
            <Text style={styles.buttonText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>دسترسی رد شد</Text>
          <Text style={styles.errorSub}>بدون دسترسی نمی‌توانیم مخاطبین را نمایش دهیم.</Text>
          <TouchableOpacity style={styles.button} onPress={handleRetryPermission}>
            <Text style={styles.buttonText}>اعطای دسترسی</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* هدر شامل عنوان و شمارنده */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مخاطبین من</Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>امتیاز: {counter.toFixed(2)}</Text>
        </View>
      </View>
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={contacts}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* لودر چرخان در پایین صفحه */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#ed1944" />
        <Text style={styles.footerText}>در حال پردازش...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ed1944',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#ed1944',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counterBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(237, 25, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ed1944',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#636e72',
  },
  errorBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#ed1944',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    color: '#ed1944',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  footerText: {
    marginLeft: 8,
    color: '#636e72',
    fontSize: 12,
  }
});