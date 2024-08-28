import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ShowFilesInTableProps, ShowFilesProps, decryptedFile, file } from "@src/types";
import { convertUint8ToUrl, formatBytes, removeFileExtension } from "@src/utils";
import React from "react";
import { useTranslation } from "react-i18next";
export default function ShowFilesInTable({files,removeExtensions}:ShowFilesInTableProps) {
  const { t } = useTranslation();

    return (
        <div className="overflow-x-auto mb-3">
            <div className="divider">FILES</div>

            <table className="table">
                {/* head */}
                <thead>
                    <tr>
                        <th>Nr</th>
                        <th>{t("file")}</th>
                        <th>{t("signatureInfo")}</th>
                        <th>{t("size")}</th>
                    </tr>
                </thead>
                <tbody>
                {/* row 1 */}
                {files.map((e: decryptedFile,index:number) => (
                    <tr key={index}>
                        <th>{++index}</th>
                        <td>
                            <a href={convertUint8ToUrl(e.data) || ""} download={removeExtensions?removeFileExtension(e.fileName):(e.fileName)} key={index}>
                                <button className="btn btn-success">
                                <FontAwesomeIcon icon={faDownload} />
                                {removeExtensions?removeFileExtension(e.fileName):(e.fileName)}
                                </button>
                            </a>
                        </td>
                        <td className={`${e.signatureStatus}`}>{e.signatureMessages}</td>
                        <td>{formatBytes(e.data.length)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}