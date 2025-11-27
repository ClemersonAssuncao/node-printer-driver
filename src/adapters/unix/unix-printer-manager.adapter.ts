// Unix Printer Manager Adapter - implements IPrinterManager interface
import type { IPrinterManager } from '../../core/interfaces';
import type { PrinterInfo, PrinterCapabilities } from '../../core/types';
import { UnixPrinterManager } from '../../unix-printer';

/**
 * Adapter that wraps UnixPrinterManager static methods to implement IPrinterManager interface
 */
export class UnixPrinterManagerAdapter implements IPrinterManager {
  async getAvailablePrinters(): Promise<PrinterInfo[]> {
    const printers = await UnixPrinterManager.getAvailablePrinters();
    // Convert UnixPrinterInfo to PrinterInfo
    return printers.map(p => ({
      name: p.name,
      status: 0, // Unix doesn't provide numeric status codes
      isDefault: p.isDefault || false,
      location: p.location,
      comment: p.description
    }));
  }
  
  async getDefaultPrinter(): Promise<string | null> {
    return UnixPrinterManager.getDefaultPrinter();
  }
  
  async printerExists(printerName: string): Promise<boolean> {
    return UnixPrinterManager.printerExists(printerName);
  }
  
  async getPrinterCapabilities(printerName: string): Promise<PrinterCapabilities | null> {
    // Unix doesn't have a built-in way to get detailed capabilities
    // Return basic capabilities based on printer existence
    const exists = await this.printerExists(printerName);
    if (!exists) {
      return null;
    }
    
    return {
      supportsDuplex: true, // Most modern Unix printers support duplex
      supportsColor: true,
      availablePaperSizes: ['A4', 'Letter', 'Legal'], // Common paper sizes
      defaultPaperSize: 'A4',
      availablePaperSources: [] // Unix doesn't provide paper source info
    };
  }
}
