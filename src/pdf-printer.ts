import * as fs from 'fs';
import * as path from 'path';
import koffi from 'koffi';
import {
  OpenPrinterW,
  ClosePrinter,
  StartDocPrinterW,
  EndDocPrinter,
  StartPagePrinter,
  EndPagePrinter,
  WritePrinter,
  DOCINFOW,
  DEVMODEW,
  DocumentPropertiesW,
  DM_ORIENTATION,
  DM_PAPERSIZE,
  DM_COPIES,
  DM_DUPLEX,
  DM_COLOR,
  DM_DEFAULTSOURCE,
  DUPLEX_SIMPLEX,
  DUPLEX_HORIZONTAL,
  DUPLEX_VERTICAL,
  PORTRAIT,
  LANDSCAPE,
  PAPER_A4,
  PAPER_LETTER,
  MONOCHROME,
  COLOR as COLOR_MODE,
  GetLastError
} from './windows-print-api';
import { PrinterManager } from './printer-manager';

export interface PrintOptions {
  printer?: string;           // Printer name (default: system default printer)
  copies?: number;            // Number of copies (default: 1)
  duplex?: 'simplex' | 'horizontal' | 'vertical'; // Duplex mode
  paperSize?: number;         // Paper size constant (default: A4)
  paperSource?: number;       // Paper tray/source
  orientation?: 'portrait' | 'landscape'; // Page orientation
  color?: boolean;            // Color mode (true: color, false: monochrome)
  quality?: number;           // Print quality
  collate?: boolean;          // Collate copies
}

export class PDFPrinter {
  private printerName: string;
  
  constructor(printerName?: string) {
    if (printerName) {
      if (!PrinterManager.printerExists(printerName)) {
        throw new Error(`Printer not found: ${printerName}`);
      }
      this.printerName = printerName;
    } else {
      const defaultPrinter = PrinterManager.getDefaultPrinter();
      if (!defaultPrinter) {
        // Try to get the first available printer
        const printers = PrinterManager.getAvailablePrinters();
        if (printers.length === 0) {
          throw new Error('No printers found on this system');
        }
        console.warn('No default printer found, using first available printer:', printers[0].name);
        this.printerName = printers[0].name;
      } else {
        this.printerName = defaultPrinter;
      }
    }
  }
  
  /**
   * Print a PDF file with specified options
   */
  async print(pdfPath: string, options: PrintOptions = {}): Promise<void> {
    // Validate PDF file
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }
    
    const stats = fs.statSync(pdfPath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${pdfPath}`);
    }
    
    // Open printer
    const printerName = options.printer || this.printerName;
    const hPrinter = PrinterManager.openPrinter(printerName);
    
    try {
      // Configure print settings
      const devMode = this.createDevMode(options);
      
      // Read PDF file first
      const pdfData = fs.readFileSync(pdfPath);
      
      // Prepare document info - DOC_INFO_1W has only 3 string fields
      const docName = path.basename(pdfPath);
      const docInfo = {
        pDocName: docName,
        pOutputFile: null,
        pDatatype: 'RAW'
      };
      
      // Start print job with level 1
      const jobId = StartDocPrinterW(hPrinter, 1, docInfo);
      
      if (!jobId || jobId === 0) {
        const lastError = this.getLastError();
        throw new Error(`Failed to start print job. Windows error code: ${lastError}`);
      }
      
      try {
        // Start page
        if (!StartPagePrinter(hPrinter)) {
          throw new Error('Failed to start page');
        }
        
        try {
          // Write PDF data to printer
          const bytesWritten = [0];
          if (!WritePrinter(hPrinter, pdfData, pdfData.length, bytesWritten)) {
            throw new Error('Failed to write data to printer');
          }
          
          console.log(`Successfully sent ${bytesWritten[0]} bytes to printer`);
        } finally {
          EndPagePrinter(hPrinter);
        }
      } finally {
        EndDocPrinter(hPrinter);
      }
    } finally {
      PrinterManager.closePrinter(hPrinter);
    }
  }
  
  /**
   * Print raw data directly
   */
  async printRaw(data: Buffer, documentName: string = 'Document', options: PrintOptions = {}): Promise<void> {
    const printerName = options.printer || this.printerName;
    const hPrinter = PrinterManager.openPrinter(printerName);
    
    try {
      const docInfo = {
        pDocName: documentName,
        pOutputFile: null,
        pDatatype: 'RAW'
      };
      
      const jobId = StartDocPrinterW(hPrinter, 1, docInfo);
      if (jobId === 0 || jobId === undefined) {
        const lastError = this.getLastError();
        throw new Error(`Failed to start print job. Windows error code: ${lastError}`);
      }
      
      try {
        if (!StartPagePrinter(hPrinter)) {
          throw new Error('Failed to start page');
        }
        
        try {
          const bytesWritten = [0];
          if (!WritePrinter(hPrinter, data, data.length, bytesWritten)) {
            throw new Error('Failed to write data to printer');
          }
          
          console.log(`Successfully sent ${bytesWritten[0]} bytes to printer`);
        } finally {
          EndPagePrinter(hPrinter);
        }
      } finally {
        EndDocPrinter(hPrinter);
      }
    } finally {
      PrinterManager.closePrinter(hPrinter);
    }
  }
  
  /**
   * Create DEVMODE structure with print options
   */
  private createDevMode(options: PrintOptions): any {
    const devMode: any = {
      dmFields: 0
    };
    
    // Set copies
    if (options.copies && options.copies > 0) {
      devMode.dmCopies = options.copies;
      devMode.dmFields |= DM_COPIES;
    }
    
    // Set duplex mode
    if (options.duplex) {
      switch (options.duplex) {
        case 'simplex':
          devMode.dmDuplex = DUPLEX_SIMPLEX;
          break;
        case 'horizontal':
          devMode.dmDuplex = DUPLEX_HORIZONTAL;
          break;
        case 'vertical':
          devMode.dmDuplex = DUPLEX_VERTICAL;
          break;
      }
      devMode.dmFields |= DM_DUPLEX;
    }
    
    // Set paper size
    if (options.paperSize) {
      devMode.dmPaperSize = options.paperSize;
      devMode.dmFields |= DM_PAPERSIZE;
    }
    
    // Set paper source
    if (options.paperSource) {
      devMode.dmDefaultSource = options.paperSource;
      devMode.dmFields |= DM_DEFAULTSOURCE;
    }
    
    // Set orientation
    if (options.orientation) {
      devMode.dmOrientation = options.orientation === 'portrait' ? PORTRAIT : LANDSCAPE;
      devMode.dmFields |= DM_ORIENTATION;
    }
    
    // Set color mode
    if (options.color !== undefined) {
      devMode.dmColor = options.color ? COLOR_MODE : MONOCHROME;
      devMode.dmFields |= DM_COLOR;
    }
    
    return devMode;
  }
  
  /**
   * Get printer name being used
   */
  getPrinterName(): string {
    return this.printerName;
  }
  
  /**
   * Get printer capabilities
   */
  getCapabilities() {
    return PrinterManager.getPrinterCapabilities(this.printerName);
  }
  
  /**
   * Get last Windows error code
   */
  private getLastError(): number {
    try {
      return GetLastError();
    } catch {
      return 0;
    }
  }
}
