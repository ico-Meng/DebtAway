"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { usePlaidLink } from "react-plaid-link";
import { API_ENDPOINT } from "./config";
import React from "react";

export const UserProfile = ({
    userId,
    setUserId,
}: {
    userId: string | null;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {

    const { user } = useAuthenticator((context) => [context.user]);
    const username = user?.signInDetails?.loginId || "Guest";

    useEffect(() => {
        if (username && !userId) {
            setUserId(username);
        }
    }, [username, userId]);

    return `Username: ${username}`;
};


interface PlaidIntegrationProps {
    userId: string | null;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
    clientId: string | null;
    setClientId: React.Dispatch<React.SetStateAction<string | null>>;
    linkToken: string | null;
    setLinkToken: React.Dispatch<React.SetStateAction<string | null>>;
    publicToken: string | null;
    setPublicToken: React.Dispatch<React.SetStateAction<string | null>>;
    onOpen: (open: () => void, ready: boolean) => void; // Pass the open function and ready state to App
}


export const PlaidIntegration: React.FC<PlaidIntegrationProps> = ({
    userId,
    setUserId,
    clientId,
    setClientId,
    linkToken,
    setLinkToken,
    publicToken,
    setPublicToken,
    onOpen
}) => {

    const [isLayerReady, setIsLayerReady] = useState<boolean>(false);

    useEffect(() => {
        if (!userId || linkToken) {
            console.log("UserId is not set yet or linkToken is already fetched.");
            return;
        }

        const fetchLinkToken = async () => {
            console.log("clientId: ", clientId)
            console.log("linkToken: ", linkToken)

            //if (!userId || linkToken) {
            //    console.log("UserId is not set yet or linkToken is already fetched.");
            //    return;
            //}

            try {
                console.log("================")
                console.log("userId: ", userId)
                const apiEndpoint = `${API_ENDPOINT}/create-link-token`;
                //const apiEndpoint = "https://jb6jiia3k6.execute-api.us-east-1.amazonaws.com/prod/create-link-token";
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch link token: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.link_token !== linkToken) {
                    setClientId(userId);
                    setLinkToken(data.link_token);
                }

                console.log("clientId: ", clientId)
                console.log("linkToken: ", linkToken)

            } catch (error) {
                console.error("Error fetching link token:", error);
            }
        };
        fetchLinkToken();
    }, [userId, /*setClientId, setLinkToken, clientId,*/ linkToken]); // Re-run effect when userId or linkToken changes


    // Initialize Plaid Link with the link token
    const { open, exit, ready, submit } = usePlaidLink({
        token: linkToken || "",
        onSuccess: async (publicToken, metadata) => {
            console.log("metadata:", metadata);
            console.log("Public Token:", publicToken);
            console.log("linkToken:", linkToken);
            setPublicToken(publicToken);

            // Send the public token to your Lambda backend to exchange for an access token
            try {
                const apiEndpoint = `${API_ENDPOINT}/exchange-public-token`;
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        publicToken: publicToken,
                        linkToken: linkToken,
                        clientId: clientId,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to exchange public token: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Access Token Response:", data);

                //localStorage.setItem("accountAccess", JSON.stringify(data));

            } catch (error) {
                console.error("Error exchanging public token:", error);
            }
        },
        onExit: (error, metadata) => {
            if (error) {
                console.error("Plaid Link error:", error);
            }
            console.log("User exited Plaid Link:", metadata);
        },
        onEvent: (eventName, metadata) => {
            switch (eventName) {
                case "LAYER_READY":
                    // Open Link
                    //open({...})
                    console.log("Layer Ready !!! :)")
                    console.log(`Event: ${eventName}`, metadata);
                    if (!isLayerReady) {
                        setIsLayerReady(true);
                    }
                    break;
                case "LAYER_NOT_AVAILABLE":
                    // Run another fallback flow
                    console.log("Layer Not Available !!! TT")
                    console.log(`Event: ${eventName}`, metadata);
                    break;
                default:
                    //Other cases ignored in this use case
                    break;
            }
        }
    });

    useEffect(() => {
        if (onOpen && open && ready) {
            onOpen(open as () => void, ready);
        }
    }, [open, ready, onOpen]);

    return null;
};


export async function getAccount({
    clientId,
    linkToken,
    router,
}: {
    clientId: string | null;
    linkToken: string | null;
    router: ReturnType<typeof useRouter>;
}) {
    console.log("clientId: ", clientId)
    console.log("linkToken: ", linkToken)

    //const router = useRouter(); // For navigation
    try {
        const queryParams = new URLSearchParams({
            clientId: clientId ?? "",
            linkToken: linkToken ?? ""
        }).toString();
        const apiEndpoint = `${API_ENDPOINT}/get-account?${queryParams}`;
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        });
        console.log("response = ", response);

        const data = await response.json();
        console.log("data = ", data);

        localStorage.setItem('accountBalance', JSON.stringify(data));
        console.log("accountBalance = ", localStorage.getItem('accountBalance'));

        router.push(`/balance?client_id=${queryParams}`); // Navigate to the balance page
    }
    catch (error) {
        console.error("Error get account:", error);
    }
}


export async function testicoicoapi() {
    try {
        const apiEndpoint = `${API_ENDPOINT}/test2-api`;
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
            //credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Failed to test-api: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("response = ", data);
    }
    catch (error) {
        console.error("Failed to fetch accountBalance:", error);
    }
}

export async function testapi({
    clientId,
    linkToken,
    publicToken,
}: {
    clientId: string | null;
    linkToken: string | null;
    publicToken: string | null;
}) {
    try {
        const queryParams = new URLSearchParams({
            clientId: clientId ?? "",
            linkToken: linkToken ?? "",
            publicToken: publicToken ?? ""
        }).toString();
        const apiEndpoint = `${API_ENDPOINT}/test-api?${queryParams}`;
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error(`Failed to test-api: ${response.statusText}`);
        }
        console.log("response = ", response);
        const data = await response.json();
        console.log("data = ", data);
        //const queryParams = new URLSearchParams({ userId: userId ?? "" }).toString();
        //router.push(`/balance?client_id=${queryParams}`); // Navigate to the balance page
    }
    catch (error) {
        console.error("Failed to fetch accountBalance:", error);
    }
}

export async function creditapi({
    router
}: {
    router: ReturnType<typeof useRouter>;
}) {
    /**
     * Should pass in Experian required user data from form page
     */
    console.log("creditapi")
    try {
        const apiEndpoint = `${API_ENDPOINT}/get-credit-report`;
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch link token: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("data = ", data);

        /**
         * Format response data, redirect and pass down to Debt Status page
         */

        router.push("/debtstatus");
    }
    catch (error) {
        console.error("Failed to fetch accountBalance:", error);
    }
}
