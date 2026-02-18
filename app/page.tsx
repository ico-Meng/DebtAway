"use client";

import "./../app/app.css";
import '@aws-amplify/ui-react/styles.css'
import React from "react";
import outputs from "@/amplify_outputs.json";
import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { userManager, signOutRedirect } from "@/types";
import type { User } from "oidc-client-ts";
import { UserProfile } from "@/app/components/link";

import Image from "next/image";

Amplify.configure(outputs);

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle sign-in callback and get existing user
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to handle callback (if returning from Cognito)
        const callbackUser = await userManager.signinCallback();
        if (callbackUser) {
          setUser(callbackUser);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Not a callback scenario or callback failed, continue to check for existing user
      }

      // If no callback, try to get existing user
      try {
        const existingUser = await userManager.getUser();
        if (existingUser && !existingUser.expired) {
          setUser(existingUser);
        }
      } catch (getUserError) {
        console.error("Get user error:", getUserError);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for user changes
  useEffect(() => {
    const handleUserLoaded = (loadedUser: User | null) => {
      setUser(loadedUser);
      setIsLoading(false);
    };

    const handleUserUnloaded = () => {
      setUser(null);
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear user state immediately for UI feedback
      setUser(null);
      
      // Then redirect to Cognito logout (which will also clear the session)
      await signOutRedirect();
    } catch (error) {
      console.error("Sign-out error:", error);
      // Even if there's an error, clear the local user state
      setUser(null);
      try {
        await userManager.removeUser();
      } catch (removeError) {
        console.error("Error clearing local user:", removeError);
      }
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        <Image
          src="https://www.lssmn.org/financialcounseling/sites/financialcounseling/files/styles/blog_feature_763x476/public/blog/2023-07/Adobe_Financial_275699405%20resize.jpeg?itok=q5DOZBTS"
          alt="Career Management Plan"
          width={300}
          height={180}
          style={{ borderRadius: "5px", justifyContent: "center" }}
        />
      </div>
      <br />
      <h1 style={{ margin: 0, textAlign: 'center' }}>Ambitology</h1>

      {user ? (
        <>
          <br />
          <div className="mt-4">
            <button 
              onClick={handleSignOut}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Log out
            </button>
          </div>
        </>
      ) : (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSignIn}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      )}
    </main>
  );
}
