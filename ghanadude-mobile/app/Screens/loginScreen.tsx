import React, { useState } from 'react';
import { Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const {width, height} = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#808080"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

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

      <View style={styles.forgotPass}>
      <TouchableOpacity>
          <Text style={styles.forgotPassText}>
        Forgot password?
        </Text>
      </TouchableOpacity>
      </View>

        <View style={styles.row}>
          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={() => console.log('Login pressed')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* "Or" text */}
          <Text style={styles.orText}>Or</Text>

          {/* Google Icon Button */}
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            <FontAwesome name="google" size={25} color="#DB4437" /> {/* Google Icon */}
          </TouchableOpacity>

          {/* Facebook Icon Button */}
          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
            <FontAwesome name="facebook" size={25} color="#4267B2" /> {/* Facebook Icon */}
          </TouchableOpacity>
        </View>


        <View style={styles.hr} />

       <View style={styles.signUpRow}>
  <Text style={styles.SignUpText}>Don't have an account?</Text>
  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
    <Text style={styles.SignUpLink}> Sign up</Text>
  </TouchableOpacity>
</View>

      </View>
    </SafeAreaView>
  
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EFE3B8',
    height: '100%'
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
 forgotPass: {
   display: 'flex',
   alignItems: 'flex-end',
   marginRight: '25%',
   marginTop: '-8%'
 },
 forgotPassText: {
   fontSize: width * 0.04,
   color: '#AA603A'
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
    marginTop: 15,
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
    width: width * 0.10,
    height: width * 0.10, 
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
  signUpRow: {
  flexDirection: 'row',
  justifyContent: 'start',
  alignItems: 'start',
  marginTop: 2, 
},
  SignUpText: {
    fontSize: width * 0.05,
    marginLeft: '8%'
  },
  SignUpLink: {
    fontSize: width * 0.05,
    color: '#AA603A',
  }
});
