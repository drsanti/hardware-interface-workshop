/// <reference types="vite/client" />

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
}

interface Serial {
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

interface SerialPortRequestOptions {
  filters?: Array<{ usbVendorId?: number; usbProductId?: number }>;
}

interface BluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  readonly device: BluetoothDevice;
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  readonly device: BluetoothDevice;
  readonly uuid: string;
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly service: BluetoothRemoteGATTService;
  readonly uuid: string;
  readonly value?: DataView;
  writeValueWithResponse(value: BufferSource): Promise<void>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface Bluetooth {
  requestDevice(options: {
    filters?: Array<{
      services?: string[];
      name?: string;
      namePrefix?: string;
    }>;
    optionalServices?: string[];
    acceptAllDevices?: boolean;
  }): Promise<BluetoothDevice>;
}

interface Navigator {
  serial?: Serial;
  bluetooth?: Bluetooth;
}
