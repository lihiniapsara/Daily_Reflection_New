import { View, ActivityIndicator } from "react-native"
import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"

const Index = () => {
  const router = useRouter()
  const { user, loading } = useAuth()
  console.log("User data :", user)

  useEffect(() => {
    if (!loading) {
      console.log("User data :", user)
      if (user) router.replace("/home")
      else router.replace("/login")
    }
  }, [user, loading])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return null
}

export default Index
