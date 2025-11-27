import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface UnixPrinterInfo {
  name: string;
  description?: string;
  location?: string;
  status?: string;
  isDefault?: boolean;
}

export class UnixPrinterManager {
  /**
   * Get list of all available printers using lpstat
   */
  static async getAvailablePrinters(): Promise<UnixPrinterInfo[]> {
    try {
      const { stdout } = await execAsync('lpstat -p -d 2>/dev/null || lpstat -p');
      const printers: UnixPrinterInfo[] = [];
      const defaultPrinter = await this.getDefaultPrinter();
      
      const lines = stdout.split('\n').filter(line => line.startsWith('printer'));
      
      for (const line of lines) {
        // Format: "printer PrinterName is idle. enabled since ..."
        const match = line.match(/printer\s+(\S+)\s+(.*)/);
        if (match) {
          const name = match[1];
          const status = match[2];
          
          printers.push({
            name,
            status,
            isDefault: name === defaultPrinter
          });
        }
      }
      
      return printers;
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Get the default printer name using lpstat -d
   */
  static async getDefaultPrinter(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('lpstat -d 2>/dev/null');
      // Format: "system default destination: PrinterName" or "no system default destination"
      const match = stdout.match(/default destination:\s+(\S+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Check if a printer exists
   */
  static async printerExists(printerName: string): Promise<boolean> {
    const printers = await this.getAvailablePrinters();
    return printers.some(p => p.name === printerName);
  }
}

export interface UnixPrintOptions {
  printer?: string;
  copies?: number;
  duplex?: 'simplex' | 'horizontal' | 'vertical';
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  color?: boolean;
  fitToPage?: boolean;
}

export class UnixPDFPrinter {
  private printerName: string;
  private initialized: boolean = false;
  
  constructor(printerName?: string) {
    this.printerName = printerName || '';
    
    // Synchronous validation for provided printer name
    // Note: This is a basic check - full validation happens in initialize()
    if (printerName) {
      // Throw immediately if printer name looks invalid
      // Full async validation will happen on first print operation
      if (printerName.trim().length === 0) {
        throw new Error('Printer name cannot be empty');
      }
    }
  }
  
  /**
   * Initialize printer name (async because we need to query default)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    if (!this.printerName) {
      const defaultPrinter = await UnixPrinterManager.getDefaultPrinter();
      if (!defaultPrinter) {
        const printers = await UnixPrinterManager.getAvailablePrinters();
        if (printers.length === 0) {
          throw new Error('No printers found on this system');
        }
        console.warn('No default printer found, using first available printer:', printers[0].name);
        this.printerName = printers[0].name;
      } else {
        this.printerName = defaultPrinter;
      }
    } else {
      // Validate that the provided printer actually exists
      const exists = await UnixPrinterManager.printerExists(this.printerName);
      if (!exists) {
        throw new Error(`Printer not found: ${this.printerName}`);
      }
    }
    
    this.initialized = true;
  }
  
  /**
   * Print a PDF file using lp command
   */
  async print(pdfPath: string, options: UnixPrintOptions = {}): Promise<void> {
    // Validate PDF file
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }
    
    const stats = fs.statSync(pdfPath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${pdfPath}`);
    }
    
    await this.initialize();
    
    const printerName = options.printer || this.printerName;
    const args: string[] = [];
    
    // Printer destination
    args.push('-d', printerName);
    
    // Number of copies
    if (options.copies && options.copies > 1) {
      args.push('-n', options.copies.toString());
    }
    
    // Duplex mode
    if (options.duplex) {
      switch (options.duplex) {
        case 'simplex':
          args.push('-o', 'sides=one-sided');
          break;
        case 'horizontal':
          args.push('-o', 'sides=two-sided-short-edge');
          break;
        case 'vertical':
          args.push('-o', 'sides=two-sided-long-edge');
          break;
      }
    }
    
    // Paper size (e.g., 'a4', 'letter', 'legal')
    if (options.paperSize) {
      args.push('-o', `media=${options.paperSize}`);
    }
    
    // Orientation
    if (options.orientation) {
      args.push('-o', `orientation-requested=${options.orientation === 'landscape' ? '4' : '3'}`);
    }
    
    // Color mode
    if (options.color !== undefined) {
      args.push('-o', `print-color-mode=${options.color ? 'color' : 'monochrome'}`);
    }
    
    // Fit to page
    if (options.fitToPage) {
      args.push('-o', 'fit-to-page');
    }
    
    // Add the file path
    args.push(pdfPath);
    
    // Execute lp command
    const command = `lp ${args.join(' ')}`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('request id')) {
        throw new Error(`Print command failed: ${stderr}`);
      }
      
      console.log('Print job submitted successfully');
      if (stdout) {
        console.log(stdout.trim());
      }
    } catch (error: any) {
      throw new Error(`Failed to print: ${error.message}`);
    }
  }
  
  /**
   * Print raw data (save to temp file first, then print)
   */
  async printRaw(data: Buffer, documentName: string = 'Document', options: UnixPrintOptions = {}): Promise<void> {
    // Create a temporary file
    const tempDir = '/tmp';
    const tempFile = path.join(tempDir, `${documentName}-${Date.now()}.pdf`);
    
    try {
      fs.writeFileSync(tempFile, data);
      await this.print(tempFile, options);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }
  
  /**
   * Get printer name being used
   */
  getPrinterName(): string {
    return this.printerName;
  }
  
  /**
   * Get printer capabilities (limited on Unix)
   */
  async getCapabilities() {
    return {
      supportsDuplex: true, // Most modern printers support duplex
      supportsColor: true,
      note: 'Unix printer capabilities are limited. Actual support depends on printer and CUPS configuration.'
    };
  }
}
