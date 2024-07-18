import React, { useState } from "react";
export default function Decryption() {
    const [encryptedMessage,setEncryptedMessage] = useState<string>("");


    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">Decryption</h2>
            <div className="p-4 flex flex-col">
                <label htmlFor="message" className="block text-sm font-medium">Encrypted message:</label>
                <textarea id="message"
                    className="h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={encryptedMessage} onChange={(e)=>{setEncryptedMessage(e.target.value)}}></textarea>

                
                <button 
                    className="mt-4 btn btn-info" >Decrypt</button>
            </div>

            <div className="p-4 mb-6" id="encryptedMessage">
                
            </div>
        </div>
    );
}