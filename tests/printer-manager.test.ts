import * as os from 'os';

const describeWindows = os.platform() === 'win32' ? describe : describe.skip;

describeWindows('PrinterManager', () => {
  let PrinterManager: typeof import('../src/printer-manager').PrinterManager;

  beforeAll(async () => {
    if (os.platform() === 'win32') {
      const module = await import('../src/printer-manager');
      PrinterManager = module.PrinterManager;
    }
  });

  describe('getAvailablePrinters', () => {
    it('should return an array of printers', () => {
      const printers = PrinterManager.getAvailablePrinters();
      expect(Array.isArray(printers)).toBe(true);
    });

    it('should return printers with required properties', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const printer = printers[0];
        expect(printer).toHaveProperty('name');
        expect(typeof printer.name).toBe('string');
        expect(printer.name.length).toBeGreaterThan(0);
      }
    });

    it('should return printers with status information', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const printer = printers[0];
        expect(printer).toHaveProperty('status');
        expect(typeof printer.status).toBe('number');
      }
    });
  });

  describe('getDefaultPrinter', () => {
    it('should return the default printer name or null', () => {
      const defaultPrinter = PrinterManager.getDefaultPrinter();
      expect(defaultPrinter === null || typeof defaultPrinter === 'string').toBe(true);
    });

    it('should return a valid printer name if default exists', () => {
      const defaultPrinter = PrinterManager.getDefaultPrinter();
      if (defaultPrinter) {
        expect(defaultPrinter.length).toBeGreaterThan(0);
        
        // Verify it exists in printer list
        const printers = PrinterManager.getAvailablePrinters();
        const exists = printers.some((p: any) => p.name === defaultPrinter);
        expect(exists).toBe(true);
      }
    });
  });

  describe('printerExists', () => {
    it('should return false for non-existent printer', () => {
      const exists = PrinterManager.printerExists('NonExistentPrinter_12345');
      expect(exists).toBe(false);
    });

    it('should return true for existing printer', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const exists = PrinterManager.printerExists(printers[0].name);
        expect(exists).toBe(true);
      }
    });

    it('should be case-insensitive', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const printerName = printers[0].name;
        const upperCase = printerName.toUpperCase();
        if (upperCase !== printerName) {
          const exists = PrinterManager.printerExists(upperCase);
          // Should find the printer case-insensitively
          expect(exists).toBe(true);
        }
      }
    });
  });

  describe('getPrinterCapabilities', () => {
    it('should return null for non-existent printer', () => {
      const capabilities = PrinterManager.getPrinterCapabilities('NonExistentPrinter_12345');
      expect(capabilities).toBeNull();
    });

    it('should return capabilities for existing printer', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const capabilities = PrinterManager.getPrinterCapabilities(printers[0].name);
        if (capabilities) {
          expect(capabilities).toHaveProperty('supportsDuplex');
          expect(capabilities).toHaveProperty('supportsColor');
          expect(typeof capabilities.supportsDuplex).toBe('boolean');
          expect(typeof capabilities.supportsColor).toBe('boolean');
        }
      }
    });

    it('should return available paper sizes', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const capabilities = PrinterManager.getPrinterCapabilities(printers[0].name);
        if (capabilities?.availablePaperSizes) {
          expect(Array.isArray(capabilities.availablePaperSizes)).toBe(true);
          if (capabilities.availablePaperSizes.length > 0) {
            expect(typeof capabilities.availablePaperSizes[0]).toBe('number');
          }
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty printer name', () => {
      const exists = PrinterManager.printerExists('');
      expect(exists).toBe(false);
    });

    it('should handle special characters in printer name', () => {
      const exists = PrinterManager.printerExists('Printer@#$%^&*()');
      expect(exists).toBe(false);
    });

    it('should handle very long printer name', () => {
      const longName = 'a'.repeat(1000);
      const exists = PrinterManager.printerExists(longName);
      expect(exists).toBe(false);
    });
  });
});
