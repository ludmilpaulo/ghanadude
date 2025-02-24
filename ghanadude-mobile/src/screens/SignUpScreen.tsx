import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

export default function SignUpScreen () {
  const navigation = useNavigation();
  const [email, setEmail] = useState ('');
  const [password, setPassword] = useState ('');
  const [name, setName] = useState ('');
  const [showPassword, setShowPassword] = useState (false);
  const isEmailValid = email.includes('@') && email.includes('.');
  
  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
    <Text style={styles.title}> Ghanadude sign up </Text>

    <Text style={styles.label}>Email:</Text>
    <TextInput
    style={styles.input}
    placeholder= "Enter your email"
    placeholderTextColor="#8080"
    keyboardType = "email-address"
    autoCapitalize= "none"
    value= {email}
    onChangeText= {setEmail}
    />

  {isEmailValid && (
    <>
      <Text style={styles.label}>First Name:</Text>
    <TextInput
    style={styles.input}
    placeholder="Enter your name"
    autoCapitalize= "none"
    value= {name}
    onChangeText = {setName}
    />
    </>
  )}
    
    {isEmailValid && (
      <>
    <Text style={styles.label}>Password:</Text>
    <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#808080"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.icon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#808080" />
          </TouchableOpacity>
        </View>
        </>
         )}
    
      <View style={styles.row}>
          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={() => console.log('Sign Up pressed')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          {/* "Or" text */}
          <Text style={styles.orText}>Or</Text>

          {/* Google Icon Button */}
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            <FontAwesome name="google" size={30} color="#DB4437" /> {/* Google Icon */}
          </TouchableOpacity>

          {/* Facebook Icon Button */}
          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
            <FontAwesome name="facebook" size={30} color="#4267B2" /> {/* Facebook Icon */}
          </TouchableOpacity>
        </View>

          <View style={styles.hr} />

          <View style={styles.LoginRow}>
  <Text style={styles.LoginText}>Already have an account?</Text>
  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
    <Text style={styles.LoginLink}>Login</Text>
  </TouchableOpacity>
</View>
    

    
    </View>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create ({
    safeArea: {
    backgroundColor: '#EFE3B8',
    height: '110%'
  },
  container: {
    paddingHorizontal: '2%',
    paddingVertical: '10%'
  },
  title: {
    textAlign: 'center',
    fontSize: width * 0.18,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: width * 0.05,
    marginLeft: '8%',
    marginBottom: '2%'
  },
  input: {
    backgroundColor: 'white',
    width: '70%',
    marginLeft: '8%',
    fontSize: width * 0.03,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
      inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  icon: {
    position: 'absolute',
    right: 100,
    top: '35%',
    transform: [{ translateY: -9 }], // Vertically center the icon
  },
  button: {
    backgroundColor: '#AA603A',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    marginTop: 30,
    marginLeft: '6%',
    padding: 12,
  },
  buttonText: {
    fontSize: width * 0.06,
    color: 'white',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    padding: 12,
  },
  orText: {
    fontSize: width * 0.04,
    marginRight: 10, 
    marginTop: 30,
    marginLeft: '2%',
    padding: 12,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.12,
    height: width * 0.12, 
    marginTop: 30,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4267B2',
    marginLeft: '5%',
  },
  hr: {
    height: 2,
    backgroundColor: '#ccc',
    marginVertical: 30,
    width: '90%',
    alignSelf: 'center',
  },
   LoginRow: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'start',
    marginTop: 2,
},
  LoginText: {
    fontSize: width * 0.05,
    marginLeft: '8%'
  },
  LoginLink: {
    fontSize: width * 0.05,
    color: '#AA603A',
  }
});