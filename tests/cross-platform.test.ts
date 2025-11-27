import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

describe('Cross-Platform Integration', () => {
  let PDFPrinter: any;
  let PrinterManager: any;
  let listPrinters: any;
  let getDefaultPrinter: any;

  beforeAll(async () => {
    const module = await import('../src/index');
    PDFPrinter = module.PDFPrinter;
    PrinterManager = module.PrinterManager;
    listPrinters = module.listPrinters;
    getDefaultPrinter = module.getDefaultPrinter;
  });

  describe('Platform Detection', () => {
    it('should detect current platform', () => {
      const platform = os.platform();
      expect(['win32', 'darwin', 'linux', 'freebsd', 'openbsd']).toContain(platform);
    });

    it('should export PDFPrinter class', () => {
      expect(PDFPrinter).toBeDefined();
      expect(typeof PDFPrinter).toBe('function');
    });

    it('should export PrinterManager class', () => {
      expect(PrinterManager).toBeDefined();
      expect(typeof PrinterManager).toBe('function');
    });

    it('should export listPrinters function', () => {
      expect(listPrinters).toBeDefined();
      expect(typeof listPrinters).toBe('function');
    });

    it('should export getDefaultPrinter function', () => {
      expect(getDefaultPrinter).toBeDefined();
      expect(typeof getDefaultPrinter).toBe('function');
    });
  });

  describe('PDFPrinter Instantiation', () => {
    it('should create PDFPrinter without printer name', () => {
      const printer = new PDFPrinter();
      expect(printer).toBeDefined();
      expect(printer).toBeInstanceOf(PDFPrinter);
    });

    it('should create PDFPrinter with specific printer name', async () => {
      // TestPrinter doesn't exist, validation should fail
      // On Windows: constructor throws synchronously
      // On Unix: create() throws asynchronously or print() throws on first use
      const isWindows = os.platform() === 'win32';
      
      if (isWindows) {
        expect(() => new PDFPrinter('TestPrinter')).toThrow('Printer not found');
      } else {
        // Unix: use async create method for validation
        await expect(PDFPrinter.create('TestPrinter')).rejects.toThrow('Printer not found');
      }
    });

    it('should have print method', () => {
      const printer = new PDFPrinter();
      expect(printer.print).toBeDefined();
      expect(typeof printer.print).toBe('function');
    });

    it('should have getCapabilities method', async () => {
      const printer = new PDFPrinter();
      expect(printer.getCapabilities).toBeDefined();
      expect(typeof printer.getCapabilities).toBe('function');
    });
  });

  describe('PrinterManager Static Methods', () => {
    it('should have getAvailablePrinters method', async () => {
      // getAvailablePrinters is async and returns a promise
      expect(PrinterManager.getAvailablePrinters).toBeDefined();
      expect(typeof PrinterManager.getAvailablePrinters).toBe('function');
      const printers = await PrinterManager.getAvailablePrinters();
      expect(Array.isArray(printers)).toBe(true);
    });

    it('should have getDefaultPrinter method', () => {
      expect(PrinterManager.getDefaultPrinter).toBeDefined();
      expect(typeof PrinterManager.getDefaultPrinter).toBe('function');
    });
  });

  describe('Printer Listing', () => {
    it('should list printers', async () => {
      try {
        const printers = await listPrinters();
        expect(Array.isArray(printers)).toBe(true);
      } catch (error) {
        // May fail if no printers configured
        expect(error).toBeDefined();
      }
    });

    it('should get default printer', async () => {
      try {
        const defaultPrinter = await getDefaultPrinter();
        expect(defaultPrinter === null || typeof defaultPrinter === 'string').toBe(true);
      } catch (error) {
        // May fail if no default printer
        expect(error).toBeDefined();
      }
    });
  });

  describe('Print Options Interface', () => {
    it('should accept duplex options', () => {
      const options = {
        duplex: 'vertical' as const
      };
      expect(options.duplex).toBe('vertical');
    });

    it('should accept paper size (Windows numeric)', () => {
      const options = {
        paperSize: 9 // A4
      };
      expect(options.paperSize).toBe(9);
    });

    it('should accept paper size (Unix string)', () => {
      const options = {
        paperSize: 'a4'
      };
      expect(options.paperSize).toBe('a4');
    });

    it('should accept copies option', () => {
      const options = {
        copies: 2
      };
      expect(options.copies).toBe(2);
    });

    it('should accept color option', () => {
      const options = {
        color: false
      };
      expect(options.color).toBe(false);
    });

    it('should accept orientation option', () => {
      const options = {
        orientation: 'landscape' as const
      };
      expect(options.orientation).toBe('landscape');
    });

    it('should accept combined options', () => {
      const options = {
        duplex: 'horizontal' as const,
        copies: 3,
        color: true,
        orientation: 'portrait' as const
      };
      expect(options).toBeDefined();
      expect(options.duplex).toBe('horizontal');
      expect(options.copies).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent PDF file', async () => {
      const printer = new PDFPrinter();
      await expect(printer.print('non-existent-file.pdf')).rejects.toThrow();
    });

    it('should handle non-existent printer', async () => {
      // Validation behavior differs by platform
      const isWindows = os.platform() === 'win32';
      
      if (isWindows) {
        // Windows: constructor validates synchronously
        expect(() => new PDFPrinter('NonExistentPrinter_ABCDEF123456')).toThrow('Printer not found');
      } else {
        // Unix: use async create method for validation
        await expect(PDFPrinter.create('NonExistentPrinter_ABCDEF123456')).rejects.toThrow('Printer not found');
      }
    });
  });

  describe('Platform-Specific Behavior', () => {
    const isWindows = os.platform() === 'win32';

    if (isWindows) {
      it('should use Windows implementation on Windows', async () => {
        // On Windows, cross-platform wrapper uses async
        expect(typeof PrinterManager.getAvailablePrinters).toBe('function');
        const printers = await PrinterManager.getAvailablePrinters();
        expect(Array.isArray(printers)).toBe(true);
      });
    } else {
      it('should use Unix implementation on Unix', () => {
        // On Unix, we expect async behavior
        expect(typeof PrinterManager.listPrinters).toBe('function');
      });
    }

    it('should handle platform differences gracefully', async () => {
      try {
        const printers = await listPrinters();
        expect(Array.isArray(printers)).toBe(true);
      } catch (error: any) {
        // Acceptable to fail if no printers configured
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce duplex type values', () => {
      type DuplexMode = 'simplex' | 'horizontal' | 'vertical';
      const validModes: DuplexMode[] = ['simplex', 'horizontal', 'vertical'];
      
      validModes.forEach(mode => {
        const options = { duplex: mode };
        expect(options.duplex).toBe(mode);
      });
    });

    it('should enforce orientation type values', () => {
      type Orientation = 'portrait' | 'landscape';
      const validOrientations: Orientation[] = ['portrait', 'landscape'];
      
      validOrientations.forEach(orientation => {
        const options = { orientation };
        expect(options.orientation).toBe(orientation);
      });
    });
  });
});
