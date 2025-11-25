// Main entry point for node-pdf-printer library
import * as os from 'os';
import { PrinterManager as WindowsPrinterManager } from './printer-manager';
import { PDFPrinter as WindowsPDFPrinter } from './pdf-printer';
import type { PrintOptions as WindowsPrintOptions } from './pdf-printer';
import type { PrinterInfo as WindowsPrinterInfo, PrinterCapabilities as WindowsPrinterCapabilities } from './printer-manager';
import { UnixPrinterManager, UnixPDFPrinter } from './unix-printer';
import type { UnixPrintOptions, UnixPrinterInfo } from './unix-printer';

// Detect platform
const isWindows = os.platform() === 'win32';

// Export Windows-specific types and constants
export type { WindowsPrintOptions, WindowsPrinterInfo, WindowsPrinterCapabilities };
export type { UnixPrintOptions, UnixPrinterInfo };

// Unified types
export type PrintOptions = WindowsPrintOptions | UnixPrintOptions;
export type PrinterInfo = WindowsPrinterInfo | UnixPrinterInfo;

// Export platform-specific classes if needed
export { PDFPrinter as WindowsPDFPrinter } from './pdf-printer';
export { PrinterManager as WindowsPrinterManager } from './printer-manager';
export { UnixPDFPrinter, UnixPrinterManager };

// Export Windows constants (always exported, but only work on Windows)
export {
  DUPLEX_SIMPLEX,
  DUPLEX_HORIZONTAL,
  DUPLEX_VERTICAL,
  PAPER_LETTER,
  PAPER_LEGAL,
  PAPER_A4,
  PAPER_A3,
  PAPER_TABLOID,
  PRINT_QUALITY_HIGH,
  PRINT_QUALITY_MEDIUM,
  PRINT_QUALITY_LOW,
  PRINT_QUALITY_DRAFT,
  PORTRAIT,
  LANDSCAPE,
  MONOCHROME,
  COLOR
} from './windows-print-api';

/**
 * Cross-platform PDFPrinter class that automatically selects the correct implementation
 */
export class PDFPrinter {
  private printer: WindowsPDFPrinter | UnixPDFPrinter;
  private isUnix: boolean;
  
  constructor(printerName?: string) {
    this.isUnix = !isWindows;
    
    if (isWindows) {
      this.printer = new WindowsPDFPrinter(printerName);
    } else {
      this.printer = new UnixPDFPrinter(printerName);
    }
  }
  
  async print(pdfPath: string, options: any = {}): Promise<void> {
    return this.printer.print(pdfPath, options);
  }
  
  async printRaw(data: Buffer, documentName?: string, options: any = {}): Promise<void> {
    return this.printer.printRaw(data, documentName, options);
  }
  
  getPrinterName(): string {
    return this.printer.getPrinterName();
  }
  
  async getCapabilities() {
    if (this.isUnix && 'getCapabilities' in this.printer) {
      return await (this.printer as UnixPDFPrinter).getCapabilities();
    }
    return this.printer.getCapabilities();
  }
}

/**
 * Cross-platform PrinterManager
 */
export class PrinterManager {
  static async getAvailablePrinters(): Promise<PrinterInfo[]> {
    if (isWindows) {
      return WindowsPrinterManager.getAvailablePrinters();
    } else {
      return await UnixPrinterManager.getAvailablePrinters();
    }
  }
  
  static async getDefaultPrinter(): Promise<string | null> {
    if (isWindows) {
      return WindowsPrinterManager.getDefaultPrinter();
    } else {
      return await UnixPrinterManager.getDefaultPrinter();
    }
  }
  
  static async printerExists(printerName: string): Promise<boolean> {
    if (isWindows) {
      return WindowsPrinterManager.printerExists(printerName);
    } else {
      return await UnixPrinterManager.printerExists(printerName);
    }
  }
  
  static getPrinterCapabilities(printerName: string) {
    if (isWindows) {
      return WindowsPrinterManager.getPrinterCapabilities(printerName);
    }
    return null; // Unix doesn't support this yet
  }
}

// Helper functions with cross-platform support
export async function listPrinters(): Promise<PrinterInfo[]> {
  return PrinterManager.getAvailablePrinters();
}

export async function getDefaultPrinter(): Promise<string | null> {
  return PrinterManager.getDefaultPrinter();
}

export async function printerExists(printerName: string): Promise<boolean> {
  return PrinterManager.printerExists(printerName);
}

export function getPlatform(): 'windows' | 'unix' {
  return isWindows ? 'windows' : 'unix';
}
