'use client'
import React, { createContext, useState } from "react";

interface CredentialContextType {
    credential: string;
    addCredential: (credential: string) => void;
    removeCredential: () => void;
}

export const CredentialContext = createContext<CredentialContextType>({
    credential: "",
    addCredential: () => { },
    removeCredential: () => { }
})



function CredentialContextProvider({ children }: { children: React.ReactNode }) {

    const [credential, setCredential] = useState("")

    function addCredential(credential: string) {
        setCredential(credential)
    }

    function removeCredential() {
        setCredential("")
    }

    return <CredentialContext.Provider value={{ credential, addCredential, removeCredential }}>
        {children}
    </CredentialContext.Provider>
}

export default CredentialContextProvider
