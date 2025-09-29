import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { signIn } from '@/services/authService';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const { width } = Dimensions.get('window');
const functions = getFunctions();

interface SendOTPResponse {
  data: { success: boolean };
}

interface VerifyOTPAndResetPasswordResponse {
  data: { success: boolean };
}

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState<string>("");
  const [fpSending, setFpSending] = useState(false);

  const openForgot = () => {
    setFpEmail(email || "");
    setForgotOpen(true);
  };

  const handleSendReset = async () => {
    if (!fpEmail.trim()) {
      Alert.alert("Missing email", "Please enter your email.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fpEmail.trim().toLowerCase())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    try {
      setFpSending(true);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, fpEmail.trim());
      Alert.alert(
        "Password reset link sent",
        `Check your email (${fpEmail}) for instructions.`
      );
      setForgotOpen(false);
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message || "Failed to send reset email.";
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setFpSending(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      
      // Validate inputs
      if (!email || !password) {
        Alert.alert('Missing Information', 'Please fill in all fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.toLowerCase())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      await signIn(email, password);
      
      // Show success alert
      Alert.alert(
        'Success!', 
        'You have successfully signed in.',
        [{ text: 'OK', onPress: () => router.push('/home') }]
      );
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Sign in failed';
      
      // Show error alert with more user-friendly messages
      let alertMessage = errorMessage;
      if (errorMessage.includes('auth/invalid-email')) {
        alertMessage = 'The email address is not valid.';
      } else if (errorMessage.includes('auth/user-not-found')) {
        alertMessage = 'No account found with this email address.';
      } else if (errorMessage.includes('auth/wrong-password')) {
        alertMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.includes('auth/too-many-requests')) {
        alertMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Sign In Failed', alertMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" translucent />
      <View className="flex-1 justify-center items-center bg-white">
        <View className="w-[90%] max-w-[400px] items-center">
          <View className="w-full bg-white rounded-3xl p-8 border border-gray-300 shadow-lg">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-gray-700 justify-center items-center shadow-md">
                <Ionicons
                  name="sunny-outline"
                  size={32}
                  color="#FFFFFF"
                  accessibilityLabel="App logo"
                />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mt-4 text-center">
                Welcome Back
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Continue your daily reflection journey
              </Text>
            </View>

            {error ? (
              <View className="flex-row items-center border border-red-500 rounded-xl p-3 mb-5">
                <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
                <Text className="text-red-500 text-sm ml-2 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="w-full mb-6">
              <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-4">
                <Ionicons name="mail-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  className="flex-1 text-base text-gray-800 py-3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessibilityLabel="Email input"
                />
              </View>

              <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-2">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-base text-gray-800 py-3"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              
              <Pressable
                onPress={openForgot}
                className="self-end mt-2"
              >
                <Text className="text-blue-500 font-semibold">
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className={`w-full rounded-xl bg-gray-700 shadow-md ${isLoading ? 'opacity-70' : ''}`}
              accessibilityLabel="Sign in button"
            >
              <View className="bg-gray-700 py-4 items-center rounded-xl">
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white text-base font-medium ml-2">
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-lg font-semibold">Sign In</Text>
                )}
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <View className="bg-white px-4 py-1.5 rounded-2xl mx-3">
                <Text className="text-xs text-gray-500 font-medium tracking-wider">
                  NEW TO DAILY REFLECTION?
                </Text>
              </View>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <TouchableOpacity
              onPress={handleCreateAccount}
              className="w-full bg-white border border-gray-300 rounded-xl py-3.5 items-center"
              accessibilityLabel="Create account button"
            >
              <Text className="text-gray-700 text-base font-medium">Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-500 italic text-center mt-8">
            Take a moment. Breathe. Reflect.
          </Text>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={forgotOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setForgotOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white rounded-2xl p-6 w-full max-w-md">
              <Text className="text-xl font-bold mb-4 text-center text-gray-800">
                Reset your password
              </Text>
              
              <Text className="text-gray-600 mb-4 text-center">
                Enter your email address and we'll send you a password reset link.
              </Text>

              <TextInput
                placeholder="Enter your email"
                value={fpEmail}
                onChangeText={setFpEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-xl p-4 mb-4 text-gray-900"
              />

              <Pressable
                onPress={handleSendReset}
                disabled={fpSending}
                className={`bg-blue-500 h-12 rounded-xl items-center justify-center ${
                  fpSending ? 'opacity-70' : ''
                }`}
              >
                {fpSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Send reset link</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setForgotOpen(false)}
                className="mt-4 self-center"
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}