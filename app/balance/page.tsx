"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Suspense } from "react";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';
import {
    Button,
    Table,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    Card,
    View,
    Flex,
} from "@aws-amplify/ui-react";

interface Account {
    account_id: string;
    balances: {
        available: number | null;
        current: number | null;
        limit: number | null;
        iso_currency_code: string | null;
        unofficial_currency_code: string | null;
    };
    mask: string;
    name: string;
    official_name: string | null;
    type: string;
    subtype: string;
    persistent_account_id: string;
}

interface Item {
    item_id: string;
    webhook: string;
    error: any; // Replace `any` with the specific type if known, or use `null` for this dataset
    available_products: string[];
    billed_products: string[];
    consent_expiration_time: string | null;
    update_type: string;
    auth_method: string;
    consented_products: string[];
    institution_id: string;
    institution_name: string;
    products: string[];
}

interface AccountData {
    accounts: Account[];
    item: Item;
}

interface ResponseData {
    account: AccountData;
}

export default function BalancePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BalancePageContent />
        </Suspense>
    );
}

function BalancePageContent() {
    const [balance, setBalance] = useState<AccountData | null>(null);
    const [expandedInstitutions, setExpandedInstitutions] = useState<string[]>([]);

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const searchParams = useSearchParams();
    const client_id = searchParams.get('client_id')?.split('=')[1] || null;;
    console.log("client_id = ", client_id)

    useEffect(() => {
        const data = localStorage.getItem('accountBalance');
        if (data) {
            const parsedData: ResponseData = JSON.parse(data);
            setBalance(parsedData.account);
        }
    }, []);

    console.log("balance: ", balance)

    if (!balance || !balance.accounts) {
        return <p>Loading balance...</p>;
    }

    const toggleInstitution = (institutionName: string) => {
        if (expandedInstitutions.includes(institutionName)) {
            setExpandedInstitutions(expandedInstitutions.filter((name) => name !== institutionName));
        } else {
            setExpandedInstitutions([...expandedInstitutions, institutionName]);
        }
    };


    return (
        <div
            style={{
                background: "linear-gradient(to right, #f0f4f8, #d9e6f2)", // Gradient background
                minHeight: "100vh",
                padding: "20px",
                fontFamily: "Arial, sans-serif",
                display: "flex",
                justifyContent: "center", // Center content horizontally
                alignItems: "flex-start", // Align content at the top
            }}
        >
            {/* Container with fixed width */}
            <div
                style={{
                    width: "800px", // Fixed width for consistent layout
                    maxWidth: "100%", // Ensure it adapts to smaller screens
                }}
            >
                {/* Expandable Institution Card */}
                <Card
                    style={{
                        marginBottom: "20px",
                        backgroundColor: "#ffffff", // Light card background
                        borderRadius: "10px",
                        padding: "20px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
                    }}
                >
                    <Button
                        style={{
                            fontSize: "18px",
                            textAlign: "center",
                            color: "#333",
                            width: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                        }}
                        onClick={toggleExpand}
                    >
                        Institution: {balance.item.institution_name}
                    </Button>
                </Card>

                {/* Collapsible Account Balance Details */}
                {isExpanded && (
                    <Card
                        style={{
                            padding: "20px",
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <h2 style={{ color: "#4a4a4a" }}>Account Balance Details</h2>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Official Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Subtype</TableCell>
                                    <TableCell>Available Balance</TableCell>
                                    <TableCell>Current Balance</TableCell>
                                    <TableCell>Currency</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {balance.accounts.map((account) => (
                                    <TableRow key={account.account_id}>
                                        <TableCell>{account.name}</TableCell>
                                        <TableCell>{account.official_name || "N/A"}</TableCell>
                                        <TableCell>{account.type}</TableCell>
                                        <TableCell>{account.subtype}</TableCell>
                                        <TableCell>{account.balances.available ?? "N/A"}</TableCell>
                                        <TableCell>{account.balances.current ?? "N/A"}</TableCell>
                                        <TableCell>
                                            {account.balances.iso_currency_code || "N/A"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {/* Back Button */}
                <Flex justifyContent="flex-start" style={{ marginTop: "20px" }}>
                    <Button
                        onClick={() => {
                            window.location.href = "/"; // Adjust the URL as per your routing setup
                        }}
                        variation="primary" // Correct prop for Amplify Button
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            left: "20px",
                            backgroundColor: "#333",
                            color: "#fff",
                        }}
                    >
                        Back
                    </Button>
                </Flex>
            </div>
        </div>
    );
}