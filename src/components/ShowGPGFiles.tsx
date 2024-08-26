import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ShowFilesProps, file } from "@src/types";
import { convertUint8ToUrl } from "@src/utils";
import React from "react";
export default function ShowGPGFiles({files}:ShowFilesProps) {
    return (
        <div className="flex gap-2 mt-2">
        {files.map((e: file, index:number) => (
                <a href={convertUint8ToUrl(e.data) || ""} download={`${e.fileName}.gpg`} key={index}>
                    <button className="btn btn-success">
                    <FontAwesomeIcon icon={faDownload} />
                    {`${e.fileName}.gpg`}
                    </button>
                </a>
        ))}
        </div>
    )
}