"use client";

import { View, Table, TableHead, TableRow, TableCell, TableBody, Heading, Button } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function DebtSummaryPage() {
    // Mock data for demonstration
    const data = [
        { type: "Total", totalBal: "", accounts: "", delAccounts: "", monthlyPayment: "" },
        { type: "Credit Card", totalBal: "", accounts: "", delAccounts: "", monthlyPayment: "" },
        { type: "Personal Loan", totalBal: "", accounts: "", delAccounts: "", monthlyPayment: "" },
        { type: "Mortgage", totalBal: "", accounts: "", delAccounts: "", monthlyPayment: "" },
        { type: "Other", totalBal: "", accounts: "", delAccounts: "", monthlyPayment: "" },
    ];

    return (
        <View padding="2rem" className="min-h-screen bg-gray-100">
            {/* Page Header */}
            <Heading level={2} marginBottom="2rem" textAlign="center">
                Debt Summary
            </Heading>

            <br />
            <br />
            {/* Debt Summary Table */}
            <Table variation="striped" highlightOnHover={false}>
                <TableHead>
                    <TableRow>
                        <TableCell as="th">Type</TableCell>
                        <TableCell as="th">Total Bal</TableCell>
                        <TableCell as="th"># of Accounts</TableCell>
                        <TableCell as="th"># of Del Accounts</TableCell>
                        <TableCell as="th">Monthly Payment</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.type}</TableCell>
                            <TableCell>{row.totalBal}</TableCell>
                            <TableCell>{row.accounts}</TableCell>
                            <TableCell>{row.delAccounts}</TableCell>
                            <TableCell>{row.monthlyPayment}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button
                onClick={() => {
                    window.location.href = "/debtstatus"; // Adjust the URL as per your routing setup
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