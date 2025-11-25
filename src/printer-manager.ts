import * as fs from 'fs';
import * as path from 'path';
import {
  OpenPrinterW,
  ClosePrinter,
  EnumPrintersW,
  GetDefaultPrinterW,
  DocumentPropertiesW,
  PRINTER_ENUM_LOCAL,
  PRINTER_ENUM_CONNECTIONS,
  PRINTER_INFO_2W,
  DEVMODEW,
  DM_ORIENTATION,
  DM_PAPERSIZE,
  DM_COPIES,
  DM_DUPLEX,
  DM_COLOR,
  DM_DEFAULTSOURCE,
  PORTRAIT,
  LANDSCAPE
} from './windows-print-api';
import koffi from 'koffi';

export interface PrinterInfo {
  name: string;
  serverName?: string;
  portName?: string;
  driverName?: string;
  location?: string;
  comment?: string;
  status: number;
  isDefault?: boolean;
}

export interface PrinterCapabilities {
  supportsDuplex: boolean;
  supportsColor: boolean;
  defaultPaperSize: number;
  availablePaperSizes: number[];
  availablePaperSources: number[];
}

export class PrinterManager {
  /**
   * Get list of all available printers
   */
  static getAvailablePrinters(): PrinterInfo[] {
    const printers: PrinterInfo[] = [];
    const flags = PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS;
    
    let needed = [0];
    let returned = [0];
    
    // First call to get buffer size
    EnumPrintersW(flags, null, 2, null, 0, needed, returned);
    
    if (needed[0] === 0) {
      return printers;
    }
    
    // Allocate buffer and get printer info
    const buffer = Buffer.alloc(needed[0]);
    const success = EnumPrintersW(flags, null, 2, buffer, needed[0], needed, returned);
    
    if (!success || returned[0] === 0) {
      return printers;
    }
    
    // Parse printer info structures
    const structSize = koffi.sizeof(PRINTER_INFO_2W);
    const defaultPrinter = this.getDefaultPrinter();
    
    for (let i = 0; i < returned[0]; i++) {
      const offset = i * structSize;
      const printerInfo = koffi.decode(buffer.slice(offset, offset + structSize), PRINTER_INFO_2W);
      
      printers.push({
        name: printerInfo.pPrinterName || '',
        serverName: printerInfo.pServerName || undefined,
        portName: printerInfo.pPortName || undefined,
        driverName: printerInfo.pDriverName || undefined,
        location: printerInfo.pLocation || undefined,
        comment: printerInfo.pComment || undefined,
        status: printerInfo.Status,
        isDefault: printerInfo.pPrinterName === defaultPrinter
      });
    }
    
    return printers;
  }
  
  /**
   * Get the default printer name
   */
  static getDefaultPrinter(): string | null {
    const bufferSize = [256];
    const buffer = Buffer.alloc(bufferSize[0] * 2); // Unicode characters
    
    const success = GetDefaultPrinterW(buffer, bufferSize);
    
    if (!success) {
      return null;
    }
    
    // Decode UTF-16 string
    let printerName = '';
    for (let i = 0; i < bufferSize[0] * 2; i += 2) {
      const charCode = buffer.readUInt16LE(i);
      if (charCode === 0) break;
      printerName += String.fromCharCode(charCode);
    }
    
    return printerName || null;
  }
  
  /**
   * Check if a printer exists
   */
  static printerExists(printerName: string): boolean {
    const printers = this.getAvailablePrinters();
    return printers.some(p => p.name.toLowerCase() === printerName.toLowerCase());
  }
  
  /**
   * Get printer capabilities
   */
  static getPrinterCapabilities(printerName: string): PrinterCapabilities | null {
    const hPrinter = [null];
    
    if (!OpenPrinterW(printerName, hPrinter, null)) {
      return null;
    }
    
    try {
      const devMode = [{}];
      const result = DocumentPropertiesW(null, hPrinter[0], printerName, devMode, null, 0);
      
      if (result < 0) {
        return null;
      }
      
      const dm = devMode[0] as any;
      
      return {
        supportsDuplex: dm.dmDuplex !== undefined && dm.dmDuplex > 0,
        supportsColor: dm.dmColor !== undefined && dm.dmColor > 1,
        defaultPaperSize: dm.dmPaperSize || 9, // A4
        availablePaperSizes: [1, 5, 8, 9], // Letter, Legal, A3, A4
        availablePaperSources: [1, 2, 3, 4] // Auto, Upper, Lower, Manual
      };
    } finally {
      ClosePrinter(hPrinter[0]);
    }
  }
  
  /**
   * Open a printer handle
   */
  static openPrinter(printerName: string): any {
    const hPrinter = [null];
    
    if (!OpenPrinterW(printerName, hPrinter, null)) {
      throw new Error(`Failed to open printer: ${printerName}`);
    }
    
    return hPrinter[0];
  }
  
  /**
   * Close a printer handle
   */
  static closePrinter(hPrinter: any): void {
    if (hPrinter) {
      ClosePrinter(hPrinter);
    }
  }
}
