import { Buffer } from 'buffer';
import net from 'net';
let firefoxExtensionID:string;
let firefoxExtensionUID:string;
export const loadFirefoxAddon = (port: number, host: string, addonPath: string) => {
    return new Promise<{status:boolean,extensionID:string|undefined}>((resolve) => {
        const socket = net.connect({
            port,
            host,
        });

        let success = false;

        socket.once('error', () => {});
        socket.once('close', () => {
            resolve({status:success,extensionID:firefoxExtensionUID});
        });

        const send = (data: Record<string, string>) => {
            const raw = Buffer.from(JSON.stringify(data));

            socket.write(`${raw.length}`);
            socket.write(':');
            socket.write(raw);
        };

        send({
            to: 'root',
            type: 'getRoot',
        });

        const onMessage = (message: any) => {
            if (message.addonsActor) {
                send({
                    to: message.addonsActor,
                    type: 'installTemporaryAddon',
                    addonPath,
                });
            }
            if(message.addons){
                for(const addon of message.addons){
                    if(addon.id===firefoxExtensionID){
                        firefoxExtensionUID=addon.manifestURL.split('/')[2];
                        socket.end();
                        break;
                    }
                }
            }

            if (message.addon) {
                send({
                    to: "root",
                    type: 'listAddons',
                });
                success = true;
                firefoxExtensionID=message.addon.id;
            }

            if (message.error) {
                socket.end();
            }
        };

        const buffers: Buffer[] = [];
        let remainingBytes = 0;

        socket.on('data', (data) => {
            while (true) {
                if (remainingBytes === 0) {
                    const index = data.indexOf(':');

                    buffers.push(data);

                    if (index === -1) {
                        return;
                    }

                    const buffer = Buffer.concat(buffers);
                    const bufferIndex = buffer.indexOf(':');

                    buffers.length = 0;
                    remainingBytes = Number(buffer.subarray(0, bufferIndex).toString());

                    if (!Number.isFinite(remainingBytes)) {
                        throw new Error('Invalid state');
                    }

                    data = buffer.subarray(bufferIndex + 1);
                }

                if (data.length < remainingBytes) {
                    remainingBytes -= data.length;
                    buffers.push(data);
                    break;
                } else {
                    buffers.push(data.subarray(0, remainingBytes));

                    const buffer = Buffer.concat(buffers);
                    buffers.length = 0;

                    const json = JSON.parse(buffer.toString());
                    queueMicrotask(() => {
                        onMessage(json);
                    });

                    const remainder = data.subarray(remainingBytes);
                    remainingBytes = 0;

                    if (remainder.length === 0) {
                        break;
                    } else {
                        data = remainder;
                    }
                }
            }
        });
    });
};