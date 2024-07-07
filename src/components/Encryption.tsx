import React from "react";
export default function Encryption() {
    return (

        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4 text-center">Encryption</h2>
            <div className="p-4">
                <label htmlFor="message" className="block text-sm font-medium ">Message:</label>
                <textarea id="message"
                    className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md"></textarea>

                <div className="mt-4">
                    <label id="publicKeysLabel" htmlFor="keys" className="block text-sm font-medium ">Select the
                        recipient's
                        public key:</label>

                    <div className="flex gap-2">
                        <select id="publicKeysDropdown" name="keys"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 basis-5/6">
                        </select>
                        <button id="newPublicKey"
                            className="mt-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6">+</button>
                    </div>


                    <label id="privateKeysLabel" htmlFor="keys" className="block text-sm font-medium  pt-3">Sign with
                        private key:</label>
                    <div className="flex gap-2">
                        <select id="privateKeysDropdown" name="keys"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 basis-5/6">
                        </select>
                        <button id="newPrivateKey"
                            className="mt-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6">+</button>
                    </div>
                    <label className="cursor-pointer label pb-0">
                        <input id="signMessageToggle" type="checkbox" className="toggle toggle-success"
                            defaultChecked={true} />
                        <span className="label-text pl-3">Sign the message</span>
                    </label>
                </div>
                <button id="encryptBtn"
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Encrypt</button>
            </div>
            <div className="p-4" id="encryptedMessage"></div>
        </div>
    );
}