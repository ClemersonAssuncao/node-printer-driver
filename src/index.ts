// Clean Architecture Entry Point
export * from './core/types';
export * from './core/interfaces';
export { PlatformDetector } from './services/platform-detector.service';
export { PrinterFactory } from './factories/printer.factory';

// Re-export platform-specific implementations for backward compatibility
export { WindowsPrinterManagerAdapter } from './adapters/windows/windows-printer-manager.adapter';
export { UnixPrinterManagerAdapter } from './adapters/unix/unix-printer-manager.adapter';
export { PDFPrinter as WindowsPDFPrinter } from './pdf-printer';
export { PrinterManager as WindowsPrinterManager } from './printer-manager';
export { UnixPDFPrinter, UnixPrinterManager } from './unix-printer';

// Export unified types for backward compatibility
export type { PrintOptions as WindowsPrintOptions } from './pdf-printer';
export type { PrinterInfo as WindowsPrinterInfo, PrinterCapabilities as WindowsPrinterCapabilities } from './printer-manager';
export type { UnixPrintOptions, UnixPrinterInfo } from './unix-printer';

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
} from './adapters/windows/api/winspool.api';

// Simple, clean facade API
import type { PrintOptions, PrinterInfo } from './core/types';
import { PrinterFactory } from './factories/printer.factory';
import { PlatformDetector } from './services/platform-detector.service';

/**
 * Cross-platform PDFPrinter - automatically uses correct implementation
 * 
 * Note: On Unix/Linux, printer validation is async. Use the static create() method
 * for validated printer creation, or validate manually before instantiation.
 * 
 * @example
 * ```typescript
 * const printer = new PDFPrinter();
 * await printer.print('./document.pdf', { copies: 2, duplex: 'vertical' });
 * 
 * // For validated creation:
 * const printer = await PDFPrinter.create('MyPrinter');
 * ```
 */
export class PDFPrinter {
  private printer: any;
  
  constructor(printerName?: string) {
    // Direct instantiation - validation happens in platform-specific implementations
    this.printer = PrinterFactory.createPrinter(printerName);
  }
  
  /**
   * Create a PDFPrinter with validation (async for Unix compatibility)
   */
  static async create(printerName?: string): Promise<PDFPrinter> {
    // Validate printer exists if name provided
    if (printerName) {
      const manager = PrinterFactory.createPrinterManager();
      const exists = await manager.printerExists(printerName);
      if (!exists) {
        throw new Error(`Printer not found: ${printerName}`);
      }
    }
    return new PDFPrinter(printerName);
  }
  
  async print(pdfPath: string, options?: PrintOptions): Promise<void> {
    return this.printer.print(pdfPath, options);
  }
  
  async printRaw(data: Buffer, documentName?: string, options?: PrintOptions): Promise<void> {
    return this.printer.printRaw(data, documentName, options);
  }
  
  getPrinterName(): string {
    return this.printer.getPrinterName();
  }
  
  async getCapabilities() {
    return this.printer.getCapabilities();
  }
}

/**
 * Cross-platform PrinterManager - automatically uses correct implementation
 * 
 * @example
 * ```typescript
 * const printers = await PrinterManager.getAvailablePrinters();
 * const defaultPrinter = await PrinterManager.getDefaultPrinter();
 * ```
 */
export class PrinterManager {
  private static manager = PrinterFactory.createPrinterManager();
  
  static async getAvailablePrinters(): Promise<PrinterInfo[]> {
    const result = this.manager.getAvailablePrinters();
    return result instanceof Promise ? await result : result;
  }
  
  static async getDefaultPrinter(): Promise<string | null> {
    const result = this.manager.getDefaultPrinter();
    return result instanceof Promise ? await result : result;
  }
  
  static async printerExists(printerName: string): Promise<boolean> {
    const result = this.manager.printerExists(printerName);
    return result instanceof Promise ? await result : result;
  }
  
  static getPrinterCapabilities(printerName: string) {
    return this.manager.getPrinterCapabilities(printerName);
  }
  
  // Alias for Unix compatibility
  static listPrinters = PrinterManager.getAvailablePrinters;
}

// Helper functions
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
  return PlatformDetector.getPlatform();
}
