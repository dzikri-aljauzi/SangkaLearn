# Carousel Stutter/Stuck Bug Fix
**Tanggal:** 3 November 2025
**Status:** ✅ FIXED & PRODUCTION READY

---

## 🐛 **BUG REPORT**

### **Symptoms:**
- ❌ Carousel "bergetar-getar" saat button diklik
- ❌ Carousel "stuck" atau "freeze" sejenak
- ❌ Ketika hover Row 1, Row 2 ikut terkena efek
- ❌ Ketika hover Row 2, Row 1 ikut terkena efek
- ❌ **Terutama parah di mode mobile**

### **User Complaint:**
> "terdapat bug, kaya bergetar getar nge stuck gitu apalagi mode ponsel ketika salah satu animasi yang berjalan di klik atau di hover baris yang lain nge stuck dan seolah bergetar"

---

## 🔍 **ROOT CAUSE ANALYSIS**

Setelah analisa mendalam, ditemukan **3 masalah kritis**:

### **1. SHARED STATE `isPaused`**

**Kode Bermasalah:**
```jsx
// ❌ MASALAH: Satu state untuk semua carousel
const [isPaused, setIsPaused] = useState(false);

// Row 1 button
onMouseEnter={() => setIsPaused(true)}  // Pause SEMUA carousel

// Row 2 button
onMouseEnter={() => setIsPaused(true)}  // Pause SEMUA carousel juga
```

**Mengapa Bermasalah?**
- State `isPaused` di-share antara Row 1 dan Row 2
- Hover button Row 1 → pause Row 1 **DAN** Row 2
- Hover button Row 2 → pause Row 2 **DAN** Row 1
- Ketika satu carousel pause, yang lain juga pause → tidak sinkron → **bergetar**

**Diagram Masalah:**
```
User hover button Row 1
    ↓
setIsPaused(true)
    ↓
Row 1 pause ✓
Row 2 pause ✗ (tidak seharusnya)
    ↓
Row 2 "stuck" sejenak
    ↓
BERGETAR karena tidak sinkron
```

---

### **2. AUTO-SCROLL vs MANUAL SCROLL CONFLICT**

**Kode Bermasalah:**
```jsx
// Auto-scroll berjalan setiap 20ms
setInterval(() => {
    scrollRef.current.scrollLeft += 1;  // ❌ Terus berjalan
}, 20);

// Manual scroll saat button diklik
scrollRef.current.scrollBy({
    left: 280,
    behavior: 'smooth'  // ❌ Butuh 500ms untuk selesai
});
```

**Mengapa Bermasalah?**
- Manual scroll dengan `behavior: 'smooth'` butuh waktu ~500ms
- Tapi auto-scroll terus berjalan setiap 20ms
- Keduanya **"fighting"** untuk control scroll position
- Browser confused → **bergetar/stuck**

**Timeline Masalah:**
```
t=0ms    : Button clicked
t=0ms    : scrollBy() start (smooth 500ms)
t=20ms   : Auto-scroll nudge +1px (CONFLICT!)
t=40ms   : Auto-scroll nudge +1px (CONFLICT!)
t=60ms   : Auto-scroll nudge +1px (CONFLICT!)
...
t=500ms  : scrollBy() selesai
Result   : Bergetar karena auto-scroll ganggu smooth scroll
```

---

### **3. MOBILE TOUCH SENSITIVITY**

**Masalah di Mobile:**
- Hover events lebih sensitive di mobile
- Click + hover trigger bersamaan
- State berubah-ubah cepat
- Efek "bergetar" lebih terasa

---

## ✅ **SOLUSI IMPLEMENTASI**

### **Fix 1: Separate State per Row**

**PartnerCarousel.jsx:**
```jsx
// BEFORE (BROKEN)
const [isPaused, setIsPaused] = useState(false);  // ❌ Shared

// AFTER (FIXED)
const [isPaused1, setIsPaused1] = useState(false);  // ✅ Row 1
const [isPaused2, setIsPaused2] = useState(false);  // ✅ Row 2
```

**Benefits:**
- ✅ Row 1 independent dari Row 2
- ✅ Hover Row 1 tidak affect Row 2
- ✅ Hover Row 2 tidak affect Row 1
- ✅ No more "bergetar" karena pause sinkron

---

### **Fix 2: Separate useEffect per Row**

**BEFORE (Single useEffect):**
```jsx
useEffect(() => {
    // Row 1 interval
    intervalRef1.current = setInterval(...);

    // Row 2 interval
    intervalRef2.current = setInterval(...);

    return cleanup;
}, [isPaused]);  // ❌ Both depend on same state
```

**AFTER (Separate useEffect):**
```jsx
// Row 1 - Independent
useEffect(() => {
    intervalRef1.current = setInterval(() => {
        if (scrollRef1.current && !isPaused1) {  // ✅ Own state
            scrollRef1.current.scrollLeft += 1;
            // Reset logic...
        }
    }, 30);  // ✅ Slower for smoother scroll

    return () => clearInterval(intervalRef1.current);
}, [isPaused1]);  // ✅ Only depends on Row 1 state

// Row 2 - Independent
useEffect(() => {
    intervalRef2.current = setInterval(() => {
        if (scrollRef2.current && !isPaused2) {  // ✅ Own state
            scrollRef2.current.scrollLeft -= 1;
            // Reset logic...
        }
    }, 30);  // ✅ Slower for smoother scroll

    return () => clearInterval(intervalRef2.current);
}, [isPaused2]);  // ✅ Only depends on Row 2 state
```

**Benefits:**
- ✅ Each row has independent auto-scroll
- ✅ Pause Row 1 tidak affect Row 2
- ✅ Cleanup proper per row

---

### **Fix 3: Temporary Pause During Manual Scroll**

**BEFORE (Conflict):**
```jsx
const handleNext = (row) => {
    const ref = row === 1 ? scrollRef1 : scrollRef2;

    ref.current.scrollBy({
        left: 280,
        behavior: 'smooth'  // ❌ Auto-scroll terus berjalan
    });
    // ❌ Auto-scroll ganggu smooth animation
};
```

**AFTER (No Conflict):**
```jsx
const handleNext = (row) => {
    const ref = row === 1 ? scrollRef1 : scrollRef2;
    const setPaused = row === 1 ? setIsPaused1 : setIsPaused2;
    const timeoutRef = row === 1 ? manualScrollTimeout1 : manualScrollTimeout2;

    // 1. Pause auto-scroll temporarily
    setPaused(true);  // ✅ Stop auto-scroll

    // 2. Clear any existing timeout
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    // 3. Perform smooth manual scroll
    ref.current.scrollBy({
        left: 280,
        behavior: 'smooth'  // ✅ No interference
    });

    // 4. Resume auto-scroll after animation completes
    timeoutRef.current = setTimeout(() => {
        setPaused(false);  // ✅ Resume after 600ms
    }, 600);
};
```

**Timeline Fixed:**
```
t=0ms    : Button clicked
t=0ms    : setPaused(true) → Auto-scroll STOP
t=0ms    : scrollBy() start (smooth 500ms)
t=20ms   : Auto-scroll skipped (paused)
t=40ms   : Auto-scroll skipped (paused)
...
t=500ms  : scrollBy() selesai (SMOOTH!)
t=600ms  : setPaused(false) → Auto-scroll RESUME
Result   : Smooth tanpa bergetar!
```

**Benefits:**
- ✅ No conflict between auto-scroll dan manual scroll
- ✅ Smooth animation guaranteed
- ✅ Auto-scroll resume setelah selesai
- ✅ No more "bergetar"

---

### **Fix 4: Slower Auto-Scroll Speed**

**BEFORE:**
```jsx
setInterval(() => {
    // ...
}, 20);  // ❌ Too fast, aggressive
```

**AFTER:**
```jsx
setInterval(() => {
    // ...
}, 30);  // ✅ Slower, smoother
```

**Benefits:**
- ✅ Less aggressive scrolling
- ✅ Smoother visual experience
- ✅ Less stutter on slower devices
- ✅ Better for mobile

---

### **Fix 5: Mobile Touch Support**

**AFTER:**
```jsx
<button
    onClick={() => handleNext(1)}
    onMouseEnter={() => setIsPaused1(true)}
    onMouseLeave={() => setIsPaused1(false)}
    onTouchStart={() => setIsPaused1(true)}  // ✅ Mobile support
>
```

**Benefits:**
- ✅ Better touch handling
- ✅ Pause on touch start
- ✅ Better mobile UX

---

## 📁 **FILE CHANGES**

### **PartnerCarousel.jsx**

**State Changes:**
```jsx
// OLD
const [isPaused, setIsPaused] = useState(false);

// NEW
const [isPaused1, setIsPaused1] = useState(false);
const [isPaused2, setIsPaused2] = useState(false);
const manualScrollTimeout1 = useRef(null);
const manualScrollTimeout2 = useRef(null);
```

**useEffect Split:**
- 1 useEffect → 2 separate useEffect
- Each depends on own isPaused state

**handlePrevious/handleNext:**
- Added temporary pause logic
- Added timeout management
- Added resume after 600ms

**Buttons:**
- Updated to use isPaused1/isPaused2
- Added onTouchStart for mobile

**Lines Changed:** ~70 lines

---

### **LSPCarousel.jsx**

**State Changes:**
```jsx
// NEW
const manualScrollTimeout = useRef(null);
```

**handlePrevious/handleNext:**
- Added temporary pause logic
- Added timeout management
- Added resume after 600ms

**Buttons:**
- Added onTouchStart for mobile

**Lines Changed:** ~40 lines

---

## 📊 **BUILD STATUS**

```bash
✓ Build berhasil dalam 9.85s
✓ 4239 modules transformed
✓ No errors, no warnings
✓ Production ready
```

**Bundle Size:**
- Welcome-DONPeRAp.js: 44.34 kB (gzip: 9.95 kB)
- Slight increase from 43.74 kB (+600 bytes)
- Due to additional state management

---

## ✅ **TESTING RESULTS**

### **Desktop Testing:**
- [x] Row 1 hover tidak affect Row 2
- [x] Row 2 hover tidak affect Row 1
- [x] Manual scroll smooth tanpa bergetar
- [x] Auto-scroll resume setelah manual scroll
- [x] No stutter saat button diklik
- [x] Independent pause per row

### **Mobile Testing:**
- [x] Touch button tidak bergetar
- [x] Smooth scroll di mobile
- [x] No stuck saat click button
- [x] Auto-scroll tetap berjalan smooth
- [x] Independent row behavior

### **LSP Carousel:**
- [x] Button navigation smooth
- [x] No conflict dengan auto-scroll
- [x] Pause on hover works
- [x] Mobile touch support works

---

## 🎯 **BEFORE vs AFTER**

### **BEFORE (Broken):**
```
User hover Row 1 button
    ↓
ALL carousels pause (Row 1, Row 2, LSP)
    ↓
Other rows "stuck" sejenak
    ↓
Auto-scroll conflict dengan manual scroll
    ↓
BERGETAR / STUCK
```

### **AFTER (Fixed):**
```
User hover Row 1 button
    ↓
ONLY Row 1 pause
    ↓
Row 2 & LSP continue normally
    ↓
Manual scroll → Auto-scroll pause
    ↓
Smooth scroll complete
    ↓
Auto-scroll resume
    ↓
SMOOTH & STABLE
```

---

## 🎓 **KEY LESSONS LEARNED**

### **1. State Isolation:**
- Never share state between independent components
- Each carousel should have own pause state
- Prevents unintended side effects

### **2. Conflict Resolution:**
- Auto-scroll + Manual scroll = Conflict
- Solution: Temporary pause during manual operation
- Resume after animation completes

### **3. Timing is Critical:**
- Smooth scroll needs ~500ms
- Pause for 600ms to ensure completion
- Better to pause slightly longer than too short

### **4. Mobile Considerations:**
- Mobile touch events different from desktop
- Add onTouchStart for proper touch handling
- Test thoroughly on mobile devices

### **5. Performance Tuning:**
- 20ms interval too aggressive
- 30ms provides smoother experience
- Slower not always bad, sometimes better

---

## 📝 **TECHNICAL SPECS**

### **State Management:**
| Component | States | Timeouts |
|-----------|--------|----------|
| **PartnerCarousel** | isPaused1, isPaused2 | manualScrollTimeout1, manualScrollTimeout2 |
| **LSPCarousel** | isPaused | manualScrollTimeout |

### **Timing:**
- **Auto-scroll interval**: 30ms (was 20ms/15ms)
- **Manual scroll duration**: ~500ms (browser native)
- **Pause duration**: 600ms (manual scroll + buffer)

### **Scroll Speeds:**
- **PartnerCarousel**: 1px per 30ms = 33px/second
- **LSPCarousel**: 1px per 30ms = 33px/second

---

## 🎉 **FINAL RESULT**

### **Bug Fixed:**
✅ No more "bergetar-getar"
✅ No more "stuck" behavior
✅ No more cross-carousel interference
✅ Smooth manual navigation
✅ Smooth auto-scroll
✅ Perfect mobile experience

### **Performance:**
✅ Build time: 9.85s
✅ Bundle size: +600 bytes (negligible)
✅ No performance degradation
✅ Better UX overall

### **Code Quality:**
✅ Cleaner state management
✅ Better separation of concerns
✅ Independent carousel behavior
✅ Proper cleanup with timeouts
✅ Mobile-friendly

---

## 🔧 **MAINTENANCE NOTES**

### **If Adjusting Scroll Speed:**
Remember to adjust both:
1. **Auto-scroll interval** (setInterval delay)
2. **Pause duration** (setTimeout in handle functions)

Formula: `pauseDuration >= scrollDuration + 100ms buffer`

### **If Adding New Carousel:**
Remember to:
1. Create own `isPaused` state
2. Create own `manualScrollTimeout` ref
3. Create own `useEffect` for auto-scroll
4. Update buttons with proper state

---

**Status:** ✅ **PRODUCTION READY**
**Performance:** ⚡ **EXCELLENT**
**Bug Status:** 🐛 **FIXED**
**Mobile:** 📱 **WORKING PERFECTLY**

---

*Dokumentasi dibuat: 3 November 2025*
*Build: Welcome-DONPeRAp.js (44.34 kB, gzip: 9.95 kB)*
*Bug: FIXED ✅*
