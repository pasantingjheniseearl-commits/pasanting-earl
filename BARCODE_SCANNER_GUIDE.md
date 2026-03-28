# Barcode Scanner Integration Guide

## Overview
Your Stock System now supports physical barcode scanners for faster inventory management. Scanners can be used to input SKU codes directly into the system.

## How It Works

### Scanner Types Supported
- **Handheld USB Barcode Scanners** (works with most devices)
- **Bluetooth Barcode Scanners**
- **Keyboard-emulating Scanners**
- Most standard POS barcode scanners

### Activation

1. **Enable Scanner Mode:**
   - Click the **📱 Scanner** button in either:
     - "Withdraw Stock" form, or
     - "Add New Inventory" form
   - Button turns green with status: "⚡ Scanner Active - Ready to scan"

2. **Scan Barcode:**
   - Point scanner at barcode
   - Scanner reads the barcode
   - SKU field auto-fills with scanned code
   - Cursor moves to Qty field automatically

3. **Complete Transaction:**
   - Enter quantity
   - Add description (optional)
   - Click "Add Stock" or "Withdraw"

4. **Disable Scanner:**
   - Click the **📱 Scanner** button again
   - Status returns to "○ Scanner Inactive"

## Feature Highlights

✅ **Automatic SKU Population**
- Barcode scanned → SKU field filled instantly
- Visual feedback with green flash animation

✅ **Smart Focus Management**
- After scan → cursor moves to Quantity field
- Faster data entry workflow

✅ **Independent Scanners**
- Each form has its own scanner mode
- Can switch between Add and Withdraw forms

✅ **Visual Feedback**
- Status indicator shows if scanner is active
- Color changes: 
  - Green (⚡ Active) = Ready to scan
  - Gray (○ Inactive) = Disabled

✅ **Timeout Handling**
- Automatically processes barcode after scanner stops
- Default timing: 100ms (configurable)

## Configuration

Adjust scanner behavior in `app.js`:

```javascript
const barcodeConfig = {
  enabled: false,
  inputBuffer: '',
  timeout: null,
  timeoutDelay: 100, // Milliseconds - adjust for scanner speed
  prefix: null
};
```

**Adjust `timeoutDelay` if:**
- Scanner is **too fast**: Increase to 150ms
- Scanner is **too slow**: Decrease to 50ms

## Technical Details

### Scanner Input Method
The system uses keyboard event listening. When you activate scanner mode:
1. Hidden input field becomes the focus
2. Scanner sends data as keyboard input (typical for USB/Bluetooth scanners)
3. System captures input and populates SKU field
4. Transaction is processed normally

### Barcode Format
- **Any barcode format supported:** UPC, EAN, QR codes, etc.
- Length: Any length (SKU field accommodates various formats)
- Characters: Alphanumeric

### Browser Compatibility
- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- Mobile browsers: ⚠️ Limited (depends on device scanner app)

## Troubleshooting

### Scanner Not Working?

1. **Check Device Connection:**
   ```
   - USB scanner: Ensure connected to USB port
   - Bluetooth: Ensure paired and connected
   - Verify in device manager
   ```

2. **Verify Scanner Mode:**
   - Button color should be green (⚡ Active)
   - Status text should show "Scanner Active"

3. **Test Scanner:**
   - Click scanner button to activate
   - Manually type a test barcode
   - Watch for SKU field to populate

4. **Adjust Timeout:**
   - Slow scanner → increase `timeoutDelay` to 150ms
   - Fast scanner → decrease to 50ms

5. **Browser Console:**
   - Press `F12` to open Developer Tools
   - Check Console tab for error messages
   - Look for "Barcode scanner initialized" message

### Barcode Not Filling SKU Field?

1. Ensure scanner mode is **ACTIVE** (green button)
2. Click on the form area before scanning
3. Check if scanner is configured correctly in device settings
4. Some scanners require a terminator character (usually Enter)
5. Test with manual keyboard input first

## Usage Example

### Scenario: Adding New Stock Items

```
1. Click "📱 Scanner" button in Add New Inventory form
   → Status shows: "⚡ Scanner Active - Ready to scan"

2. Scan first item barcode
   → SKU field auto-fills: "SKU-12345"
   → Cursor moves to Qty field

3. Type quantity: 50

4. Add optional remarks: "Winter stock"

5. Click "Add Stock"
   → Transaction recorded
   → Form clears, ready for next scan

6. Repeat steps 2-5 for more items
```

### Scenario: Stock Withdrawal

Same process but using "Withdraw Stock" form instead.

## Advanced Features

### Manual Barcode Entry
```javascript
// Use this function to manually enter a barcode
processBarcodeInput('add', 'SKU-12345');
```

### Disable/Enable Programmatically
```javascript
// In browser console:
barcodeConfig.enabled = false; // Disable scanner
barcodeConfig.enabled = true;  // Enable scanner
```

### Check Scanner Status
```javascript
// In browser console:
console.log(barcodeConfig.enabled); // true/false
console.log(barcodeConfig.inputBuffer); // Current input
```

## Performance Tips

- **Batch Scanning**: Use scanner mode for multiple items in sequence
- **Mix Methods**: Alternate between manual entry and scanning
- **Close When Not Needed**: Disable scanner to avoid accidental input
- **Keep Device Charged**: For Bluetooth scanners, maintain charge

## Security Notes

- ✅ Barcode data stored locally (sessionStorage/localStorage)
- ✅ No external transmission during scanning
- ✅ User authentication still required
- ✅ All transactions logged with timestamp and user info

## Support

For scanner issues:
1. Check camera/device settings
2. Verify barcode format is readable
3. Test with different barcode samples
4. Check browser console for errors
5. Review configuration in app.js

---

**Last Updated:** March 27, 2026
