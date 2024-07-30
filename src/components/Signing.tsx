import React, { useState } from "react";
export default function Signing() {
    const [message,setMessage] = useState<string>("");
    return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Signatures</h2>
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
            <button 
                className="mt-4 btn btn-info">Sign message</button>
        </div>
    </div>
    )
}