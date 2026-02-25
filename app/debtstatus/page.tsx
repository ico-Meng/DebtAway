"use client";

import { View, Heading, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import "@aws-amplify/ui-react/styles.css";

export default function DebtTablesPage() {
    const router = useRouter();
    const handleNextButton = () => {
        router.push("/debtsummary"); // Redirect to the /debtsummary page
    };
    const creditCardDebt = [
        { bankName: "Bank A", creditCard: "Visa", balance: "$5000", monthlyPayment: "$150", paymentStatus: "On Time" },
        { bankName: "Bank B", creditCard: "Mastercard", balance: "$3000", monthlyPayment: "$100", paymentStatus: "Late" },
    ];

    const personalLoanDebt = [
        { accountName: "Loan A", creditCard: "N/A", balance: "$7000", paymentStatus: "On Time" },
        { accountName: "Loan B", creditCard: "N/A", balance: "$4000", paymentStatus: "On Time" },
    ];

    const totalUnsecuredDebt = {
        numberOfAccounts: 4,
        balance: "$19000",
        monthlyPayment: "$250",
    };

    return (
        <View padding="2rem" className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <Heading level={2} marginBottom="2rem" textAlign="center">
                Debt Status
            </Heading>

            {/* Credit Card Debt Table */}
            <Heading level={3} marginBottom="1rem">
                Credit Card Debt
            </Heading>
            <Table>
                <TableHead>
                    <TableRow style={{ border: '2px solid #444444' }}>
                        <TableCell as="th">Bank Name</TableCell>
                        <TableCell as="th">Credit Card</TableCell>
                        <TableCell as="th">Balance</TableCell>
                        <TableCell as="th">Monthly Payment</TableCell>
                        <TableCell as="th">Payment Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {creditCardDebt.map((row, index) => (
                        <TableRow key={index} style={{ border: '2px solid #444444' }}>
                            <TableCell>{row.bankName}</TableCell>
                            <TableCell>{row.creditCard}</TableCell>
                            <TableCell>{row.balance}</TableCell>
                            <TableCell>{row.monthlyPayment}</TableCell>
                            <TableCell>{row.paymentStatus}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Personal Loan Debt Table */}
            <Heading level={3} marginTop="2rem" marginBottom="1rem">
                Personal Loan
            </Heading>
            <Table>
                <TableHead>
                    <TableRow style={{ border: '2px solid #444444' }}>
                        <TableCell as="th">Account Name</TableCell>
                        <TableCell as="th">Credit Card</TableCell>
                        <TableCell as="th">Balance</TableCell>
                        <TableCell as="th">Payment Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {personalLoanDebt.map((row, index) => (
                        <TableRow key={index} style={{ border: '2px solid #444444' }}>
                            <TableCell>{row.accountName}</TableCell>
                            <TableCell>{row.creditCard}</TableCell>
                            <TableCell>{row.balance}</TableCell>
                            <TableCell>{row.paymentStatus}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Total Unsecured Debt Table */}
            <Heading level={3} marginTop="2rem" marginBottom="1rem">
                Total Unsecured Debt
            </Heading>
            <Table>
                <TableHead>
                    <TableRow style={{ border: '2px solid #444444' }}>
                        <TableCell as="th">Number of Accounts</TableCell>
                        <TableCell as="th">Balance</TableCell>
                        <TableCell as="th">Monthly Payment</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow style={{ border: '2px solid #444444' }}>
                        <TableCell>{totalUnsecuredDebt.numberOfAccounts}</TableCell>
                        <TableCell>{totalUnsecuredDebt.balance}</TableCell>
                        <TableCell>{totalUnsecuredDebt.monthlyPayment}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button
                onClick={() => {
                    window.location.href = "/form"; // Adjust the URL as per your routing setup
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
            <Button
                onClick={handleNextButton}
                variation="primary" // Correct prop for Amplify Button
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "#333",
                    color: "#fff",
                }}
            >
                Next
            </Button>
        </View>
    );
}