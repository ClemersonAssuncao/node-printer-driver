# Test Suite

This directory contains the comprehensive test suite for node-pdf-printer.

## Test Structure

```
tests/
├── windows-print-api.test.ts    # Windows API bindings tests
├── printer-manager.test.ts      # PrinterManager functionality tests
├── pdf-printer.test.ts          # PDF printing tests (Windows)
├── unix-printer.test.ts         # Unix/CUPS printing tests
└── cross-platform.test.ts       # Cross-platform integration tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Verbose Output
```bash
npm run test:verbose
```

## Test Categories

### 1. Windows API Tests (`windows-print-api.test.ts`)

Tests the Koffi FFI bindings to Windows Print Spooler API:

- **Library Loading**: Validates winspool.drv and kernel32.dll are loaded
- **Function Bindings**: Tests all Windows API function bindings
  - OpenPrinterW, ClosePrinter
  - StartDocPrinterW, EndDocPrinter
  - StartPagePrinter, EndPagePrinter
  - WritePrinter
  - EnumPrintersW, GetDefaultPrinterW
- **Structure Definitions**: Validates DOC_INFO_1W, PRINTER_INFO_2W, DEVMODEW
- **Constant Definitions**: Tests all constants (duplex modes, paper sizes, orientations, colors)

**Platform**: Windows only (skipped on Unix)

### 2. PrinterManager Tests (`printer-manager.test.ts`)

Tests printer management functionality:

- **getAvailablePrinters**: Lists all system printers with properties
- **getDefaultPrinter**: Returns default printer name
- **printerExists**: Validates printer existence (case-insensitive)
- **getPrinterCapabilities**: Queries printer capabilities
  - Duplex support
  - Color support
  - Available paper sizes
- **Edge Cases**: Empty names, special characters, very long names

**Platform**: Windows only (skipped on Unix)

### 3. PDFPrinter Tests (`pdf-printer.test.ts`)

Tests PDF printing functionality:

- **Constructor**: Instance creation with/without printer name
- **print()**: PDF file printing with error handling
- **printRaw()**: Raw buffer printing
- **getCapabilities()**: Printer capability queries
- **Print Options**: Tests all print options
  - Duplex modes
  - Paper sizes
  - Copies
  - Color modes
  - Orientation

**Platform**: Windows only (skipped on Unix)

**Note**: Actual printing tests are skipped to avoid unwanted printouts during testing.

### 4. Unix Printer Tests (`unix-printer.test.ts`)

Tests CUPS-based printing on Unix systems:

- **Constructor**: UnixPDFPrinter instance creation
- **print()**: CUPS lp command integration
- **Print Options**: Duplex, paper size, copies, orientation
- **CUPS Integration**: Tests lpstat and lp command availability

**Platform**: Unix/Linux/macOS only (skipped on Windows)

**Note**: Tests may pass even if CUPS is not installed (graceful degradation).

### 5. Cross-Platform Tests (`cross-platform.test.ts`)

Tests the unified cross-platform API:

- **Platform Detection**: Validates OS detection
- **API Exports**: Tests all exported classes and functions
- **PDFPrinter**: Cross-platform PDFPrinter class
- **PrinterManager**: Cross-platform PrinterManager class
- **Print Options**: Validates option compatibility
- **Error Handling**: Tests error scenarios
- **Type Safety**: Validates TypeScript types

**Platform**: All platforms

## Test Configuration

Tests are configured via `jest.config.cjs`:

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  testTimeout: 10000
}
```

## Platform-Specific Testing

Tests automatically detect the platform and skip tests that don't apply:

```typescript
const describeWindows = os.platform() === 'win32' ? describe : describe.skip;
const describeUnix = os.platform() !== 'win32' ? describe : describe.skip;
```

This allows the same test suite to run on all platforms without errors.

## Coverage

Run coverage report to see detailed coverage information:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD integration
- Terminal output shows summary

## Writing New Tests

When adding new tests:

1. **Platform-Specific Tests**: Use `describeWindows` or `describeUnix`
2. **Skip Actual Printing**: Use `.skip` for tests that would print
3. **Error Handling**: Test both success and failure scenarios
4. **Type Safety**: Include TypeScript type validation tests
5. **Documentation**: Add JSDoc comments for complex test scenarios

### Example Test Structure

```typescript
import * as os from 'os';

const describeWindows = os.platform() === 'win32' ? describe : describe.skip;

describeWindows('MyFeature', () => {
  let MyClass: typeof import('../src/my-feature').MyClass;

  beforeAll(async () => {
    if (os.platform() === 'win32') {
      const module = await import('../src/my-feature');
      MyClass = module.MyClass;
    }
  });

  describe('Method', () => {
    it('should do something', () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });
});
```

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Tests Timing Out

Increase timeout in `jest.config.cjs`:
```javascript
testTimeout: 30000 // 30 seconds
```

### Module Import Errors

Ensure TypeScript is compiled:
```bash
npm run build
```

### Platform-Specific Failures

Check that platform detection is working:
```typescript
console.log('Platform:', os.platform());
```

### CUPS Not Available (Unix)

Install CUPS:
```bash
# Ubuntu/Debian
sudo apt-get install cups

# macOS
brew install cups
```

## Test Maintenance

- Update tests when adding new features
- Keep test fixtures minimal and focused
- Mock external dependencies when possible
- Document expected behavior in test names
- Run full test suite before committing changes

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
