"use client";

import "./../app/app.css";
import '@aws-amplify/ui-react/styles.css'
import React from "react";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react'
import {
  UserProfile,
  PlaidIntegration,
  getAccount,
  testapi,
  testicoicoapi
} from "@/app/components/link";

import Image from "next/image";

Amplify.configure(outputs);

// Define an interface for the render prop
interface AuthenticatorRenderProps {
  signOut: () => void;
  user: any; // Replace 'any' with the correct type if available (e.g., AmplifyUser)
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [openPlaidLink, setOpenPlaidLink] = useState<(() => void) | null>(null);
  const [isPlaidReady, setIsPlaidReady] = useState(false);

  const router = useRouter();

  const handlePlaidOpen = React.useCallback((open: () => void, ready: boolean) => {
    setOpenPlaidLink(() => open);
    setIsPlaidReady(ready);
  }, []);

  const handleTestApi = React.useCallback(() => {
    testapi({ clientId, linkToken, publicToken });
  }, [clientId, linkToken, publicToken]);

  const handleGetAccount = React.useCallback(() => {
    getAccount({ clientId, linkToken, router });
  }, [clientId, linkToken]);

  const handleDebtFormRedirect = () => {
    router.push("/form");
  };

  const handleChatRedirect = () => {
    router.push("/chat");
  };


  return (
    <Authenticator>
      {(props) => {
        const signOut = props.signOut || (() => { }); // Ensure signOut is always a function
        const user = props.user;

        return (
          <main>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
              <Image
                src="https://www.lssmn.org/financialcounseling/sites/financialcounseling/files/styles/blog_feature_763x476/public/blog/2023-07/Adobe_Financial_275699405%20resize.jpeg?itok=q5DOZBTS"
                alt="Debt Management Plan"
                width={300}
                height={180}
                style={{ borderRadius: "5px", justifyContent: "center" }}
              />
            </div>
            <br />
            <h1 style={{ margin: 0, textAlign: 'center' }}>Debt Away</h1>

            <UserProfile userId={userId} setUserId={setUserId} />
            <br />
            <br />

            <PlaidIntegration
              userId={userId}
              setUserId={setUserId}
              clientId={clientId}
              setClientId={setClientId}
              linkToken={linkToken}
              setLinkToken={setLinkToken}
              publicToken={publicToken}
              setPublicToken={setPublicToken}
              onOpen={handlePlaidOpen}
            />
            <button onClick={() => openPlaidLink && openPlaidLink()} disabled={!isPlaidReady}>
              Link with Plaid
            </button>
            <div>🥳 Fetch your bank account with Plaid</div>
            <br />

            <button
              onClick={handleDebtFormRedirect}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none">
              Debt Analysis
            </button>

            <br />
            <button onClick={handleGetAccount}>Bank Account</button>

            <button
              onClick={handleChatRedirect}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none">
              Chat AI
            </button>
            <br />

            {process.env.NODE_ENV === "development" && (
              <button onClick={() => testicoicoapi()}>Test</button>
            )}

            <br />
            <button onClick={signOut}>Sign out</button>
          </main>
        );
      }}
    </Authenticator>
    /*
      <Authenticator>
        {({ signOut, user }: AuthenticatorRenderProps) => (
          <main>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
              <Image
                src="https://www.lssmn.org/financialcounseling/sites/financialcounseling/files/styles/blog_feature_763x476/public/blog/2023-07/Adobe_Financial_275699405%20resize.jpeg?itok=q5DOZBTS"
                alt="Debt Management Plan"
                width={300}
                height={180}
                style={{ borderRadius: "5px", justifyContent: "center", }}
              />
            </div>
            <br />
            <br />
            <h1 style={{ margin: 0, textAlign: 'center' }}>Debt Away</h1>
            <div
              style={{
                fontSize: "1.5em", // Make it bigger
                color: "#000000", // Sea color (Sea Green)
              }}
            >
              <UserProfile
                userId={userId}
                setUserId={setUserId}
              />
            </div>
            <br />
            <div>
              <PlaidIntegration
                userId={userId}
                setUserId={setUserId}
                clientId={clientId}
                setClientId={setClientId}
                linkToken={linkToken}
                setLinkToken={setLinkToken}
                publicToken={publicToken}
                setPublicToken={setPublicToken}
                onOpen={handlePlaidOpen}
              />
              <button onClick={() => openPlaidLink && openPlaidLink()} disabled={!isPlaidReady}>
                Link with Plaid
              </button>
            </div>
            <div>
              🥳 Fetch your bank account with Plaid
            </div>
            <br />
            <button
              onClick={handleDebtFormRedirect}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none" >
              Debt Analysis
            </button>
  
            <br />
            <button onClick={handleGetAccount}>Bank Account</button>
  
            <br />
            <br />
            <br />
            <br />
            {process.env.NODE_ENV === "development" && (
              <button onClick={() => testicoicoapi()}>Test</button>
            )}
            <br />
            <br />
            <button onClick={signOut}>Sign out</button>
  
  
  
          </main>
        )
        }
      </Authenticator >
    */
  );
}
