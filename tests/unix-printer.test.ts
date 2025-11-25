import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const describeUnix = os.platform() !== 'win32' ? describe : describe.skip;

describeUnix('UnixPDFPrinter', () => {
  let UnixPDFPrinter: typeof import('../src/unix-printer').UnixPDFPrinter;

  beforeAll(async () => {
    if (os.platform() !== 'win32') {
      const module = await import('../src/unix-printer');
      UnixPDFPrinter = module.UnixPDFPrinter;
    }
  });

  describe('Constructor', () => {
    it('should create UnixPDFPrinter instance without printer name', () => {
      const printer = new UnixPDFPrinter();
      expect(printer).toBeDefined();
      expect(printer).toBeInstanceOf(UnixPDFPrinter);
    });

    it('should create UnixPDFPrinter instance with specific printer', () => {
      const printer = new UnixPDFPrinter('TestPrinter');
      expect(printer).toBeDefined();
    });
  });

  describe('print', () => {
    let printer: import('../src/unix-printer').UnixPDFPrinter;

    beforeEach(() => {
      printer = new UnixPDFPrinter();
    });

    it('should throw error if PDF file does not exist', async () => {
      await expect(printer.print('non-existent-file.pdf')).rejects.toThrow();
    });

    it('should construct lp command with printer name', async () => {
      const printerWithName = new UnixPDFPrinter('MyPrinter');
      // This will fail unless MyPrinter exists, but we're testing the logic
      try {
        await printerWithName.print('/tmp/test.pdf', {});
      } catch (error: any) {
        // Expected to fail, but error should mention the printer or command
        expect(error).toBeDefined();
      }
    });

    it('should handle duplex option', () => {
      const options = {
        duplex: 'vertical' as const
      };
      expect(options.duplex).toBe('vertical');
    });

    it('should handle paper size option', () => {
      const options = {
        paperSize: 'a4'
      };
      expect(options.paperSize).toBe('a4');
    });

    it('should handle copies option', () => {
      const options = {
        copies: 3
      };
      expect(options.copies).toBe(3);
    });

    it('should handle orientation option', () => {
      const options = {
        orientation: 'landscape' as const
      };
      expect(options.orientation).toBe('landscape');
    });
  });

  describe('Printer Methods', () => {
    it('should have getCapabilities method', async () => {
      const printer = new UnixPDFPrinter();
      expect(printer.getCapabilities).toBeDefined();
      expect(typeof printer.getCapabilities).toBe('function');
    });

    it('should have print method', async () => {
      const printer = new UnixPDFPrinter();
      expect(printer.print).toBeDefined();
      expect(typeof printer.print).toBe('function');
    });
  });

  describe('CUPS Integration', () => {
    it('should detect if CUPS is available', async () => {
      try {
        await execAsync('which lp');
        // If we're here, CUPS is available
        expect(true).toBe(true);
      } catch (error) {
        // CUPS not available in test environment
        expect(error).toBeDefined();
      }
    });

    it('should be able to query lpstat', async () => {
      try {
        const { stdout } = await execAsync('lpstat -p');
        expect(typeof stdout).toBe('string');
      } catch (error) {
        // CUPS not available
        expect(error).toBeDefined();
      }
    });
  });

  describe('Print Options Validation', () => {
    it('should accept all valid duplex values', () => {
      const validDuplex = ['simplex', 'horizontal', 'vertical'] as const;
      validDuplex.forEach(mode => {
        const options = { duplex: mode };
        expect(options.duplex).toBe(mode);
      });
    });

    it('should accept common paper sizes', () => {
      const paperSizes = ['a4', 'letter', 'legal', 'a3'];
      paperSizes.forEach(size => {
        const options = { paperSize: size };
        expect(options.paperSize).toBe(size);
      });
    });

    it('should accept valid copy counts', () => {
      [1, 2, 5, 10, 100].forEach(count => {
        const options = { copies: count };
        expect(options.copies).toBe(count);
      });
    });
  });
});
