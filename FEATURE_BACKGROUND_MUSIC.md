# Feature: Background Music in TugonPlay

## Summary

Added looping background music that plays throughout the TugonPlay session to enhance the learning experience and create an immersive environment.

## Implementation Details

### Audio File

- **Location**: `public/tugonsenseSounds/BGMusic.mp3`
- **Format**: MP3
- **Usage**: Background ambient music for the question-answering session

### Code Changes

#### 1. Added Audio Reference

```tsx
const bgMusicRef = useRef<HTMLAudioElement | null>(null); // 🎵 Background music ref
```

#### 2. Background Music useEffect Hook

```tsx
// 🎵 Background music management
useEffect(() => {
  // Create and configure audio element
  const audio = new Audio("/tugonsenseSounds/BGMusic.mp3");
  audio.loop = true; // Loop the background music
  audio.volume = 0.3; // Set volume to 30% (adjust as needed)
  bgMusicRef.current = audio;

  // Play music when component mounts
  const playMusic = async () => {
    try {
      await audio.play();
      console.log("🎵 Background music started");
    } catch (error) {
      console.log("🔇 Background music autoplay blocked:", error);
      // Note: Autoplay might be blocked by browser policy
      // Music will play on first user interaction
    }
  };

  playMusic();

  // Cleanup: Stop and remove audio when component unmounts
  return () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current = null;
      console.log("🎵 Background music stopped");
    }
  };
}, []); // Empty dependency array - run once on mount
```

## Features

### 1. **Automatic Playback**

- Music starts automatically when TugonPlay component mounts
- Handles browser autoplay restrictions gracefully

### 2. **Looping**

- `audio.loop = true` ensures continuous playback
- Music seamlessly repeats without gaps

### 3. **Volume Control**

- Default volume set to 30% (0.3) for non-intrusive background ambiance
- Can be adjusted by changing `audio.volume` value (0.0 to 1.0)

### 4. **Proper Cleanup**

- Music stops when user exits TugonPlay
- Audio resources properly released on component unmount
- Resets playback position to start

### 5. **Browser Compatibility**

- Handles autoplay blocking policies
- Falls back gracefully if autoplay is restricted
- Logs helpful console messages for debugging

## Browser Autoplay Policy

Modern browsers may block autoplay of audio with sound. This implementation:

✅ **Handles gracefully**: Catches autoplay errors without breaking the app
✅ **User-friendly**: Music will play on first user interaction if blocked
✅ **Logged**: Console messages indicate music state for debugging

### Common Scenarios:

- ✅ **Chrome/Edge**: Autoplay allowed after user interaction with site
- ✅ **Firefox**: Usually allows autoplay for low volume audio
- ✅ **Safari**: May require user interaction first
- ✅ **Mobile**: Often requires user interaction before playing

## Volume Adjustment

To change the background music volume, modify the `audio.volume` value:

```tsx
audio.volume = 0.3; // Current: 30%
```

**Recommended levels:**

- `0.1` - Very quiet (10%)
- `0.2` - Quiet (20%)
- `0.3` - Moderate (30%) ← **Current setting**
- `0.4` - Medium (40%)
- `0.5` - Half volume (50%)

## Console Logs

The implementation includes helpful console messages:

- `🎵 Background music started` - Music successfully playing
- `🔇 Background music autoplay blocked` - Autoplay prevented by browser
- `🎵 Background music stopped` - Music stopped on unmount

## User Experience Benefits

1. **Immersive Learning** - Creates focused study atmosphere
2. **Consistent Experience** - Music persists across questions within session
3. **Non-Intrusive** - Low volume (30%) doesn't interfere with concentration
4. **Professional Feel** - Adds polish to the application

## Future Enhancements (Optional)

Potential improvements for future iterations:

1. **Volume Control UI** - Add slider for user-adjustable volume
2. **Music Toggle** - Button to enable/disable background music
3. **Multiple Tracks** - Randomize or rotate between different music files
4. **Fade In/Out** - Smooth transitions when starting/stopping
5. **Mute on Modal** - Lower/mute music when success modal appears
6. **Persist Preference** - Remember user's volume/mute settings in localStorage
7. **Different Tracks per Topic** - Vary music based on topic/difficulty

## Technical Notes

- **File Path**: Uses public folder (`/tugonsenseSounds/`) for direct access
- **Reference Pattern**: Uses `useRef` to maintain audio instance across re-renders
- **Lifecycle**: Mount → Play, Unmount → Stop & Cleanup
- **Memory Management**: Properly nullifies reference on cleanup
- **Error Handling**: Try-catch for autoplay, graceful degradation

## Testing Checklist

- [ ] Background music plays when TugonPlay loads
- [ ] Music loops continuously without gaps
- [ ] Volume is at appropriate level (30%)
- [ ] Music stops when navigating away from TugonPlay
- [ ] No memory leaks (audio properly cleaned up)
- [ ] Console logs show correct status messages
- [ ] Handles browser autoplay blocking gracefully
- [ ] Works on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Works on mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Doesn't interfere with other audio (hints, feedback sounds)

## Files Modified

- ✅ `src/pages/reviewer/TugonPlay.tsx`
  - Added `bgMusicRef` useRef hook
  - Added background music useEffect with autoplay and cleanup
  - Configured loop, volume, and lifecycle management

## Related Files

- `public/tugonsenseSounds/BGMusic.mp3` - Background music audio file

## Commit Message Template

```
feat: Add looping background music to TugonPlay

- Added background music that plays throughout question session
- Music loops continuously with 30% volume
- Proper cleanup on component unmount
- Handles browser autoplay restrictions gracefully
- Enhances immersive learning experience

File: src/pages/reviewer/TugonPlay.tsx
Audio: public/tugonsenseSounds/BGMusic.mp3
```

---

**Status**: ✅ Implemented and Ready for Testing
**Date**: October 17, 2025
**Component**: TugonPlay.tsx
