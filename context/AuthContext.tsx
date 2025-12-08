"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { auth, db } from "../lib/firebase"
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

interface UserData {
    uid: string
    email: string
    role: "company" | "seeker"
}

interface AuthContextType {
    user: User | null
    userData: UserData | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signInWithEmailAndPassword: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser)
            
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid))
                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData)
                    } else {
                        setUserData(null)
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error)
                    setUserData(null)
                }
            } else {
                setUserData(null)
            }
            
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider())
            console.log("Google sign in successful")
        } catch (error) {
            console.error("Google sign in failed:", error)
            throw error
        }
    }

    const signInWithEmailAndPassword = async (email: string, password: string) => {
        try {
            await firebaseSignInWithEmailAndPassword(auth, email, password)
            console.log("Email sign in successful")
        } catch (error) {
            console.error("Email sign in failed:", error)
            throw error
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            setUserData(null)
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signInWithEmailAndPassword, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
