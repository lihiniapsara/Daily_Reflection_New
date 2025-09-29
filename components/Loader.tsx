import React from "react"
import { View, ActivityIndicator, Text, Platform } from "react-native"

interface LoaderProps {
  visible: boolean
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  if (!visible) return null

  return (
    <View style={{
      position: "absolute",
      top:0,
      left:0,
      right:0,
      bottom:0,
      backgroundColor:"rgba(0,0,0,0.3)",
      justifyContent:"center",
      alignItems:"center",
      zIndex: 9999,
    }}>
      <View style={{
        padding:20,
        borderRadius:20,
        backgroundColor: Platform.OS === 'web' ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
        justifyContent:"center",
        alignItems:"center",
        ...Platform.OS === 'web' ? { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } : {}
      }}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ color:"#fff", marginTop:10 }}>Loading...</Text>
      </View>
    </View>
  )
}

export default Loader
