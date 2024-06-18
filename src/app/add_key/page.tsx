export default function AddKey() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Add to contacts list</h2>
            <label htmlFor="keyName" className="text-lg mb-2">Unique key name</label>
            <input required type="text" id="keyName" className="border rounded-lg py-2 px-4 mb-4 w-full" />
            <label htmlFor="publicKey" className="text-lg mb-2">Public Key:</label>
            <textarea required id="publicKey" rows={5} className="border rounded-lg py-2 px-4 mb-4 w-full"></textarea>
            <button id="saveButton" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Save</button>
        </div>
    );
}