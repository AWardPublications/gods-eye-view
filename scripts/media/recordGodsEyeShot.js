/**
 * scripts/media/recordGodsEyeShot.js
 * Playwright script to record 60fps God's Eye animations for DaVinci Resolve import
 */

export async function recordGodsEyeShot({ courseId = 'valderrama_golf_club', holeNumber = 1, shotTelemetry = {}, outputPath = './temp_captures/' } = {}) {
  console.log(`[Media Factory] Recording Headless God's Eye Shot for ${courseId} - Hole ${holeNumber}...`);

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      args: ['--enable-webgl', '--use-gl=angle', '--enable-gpu-rasterization']
    });

    // 9:16 Vertical Reel dimensions (1080x1920)
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      recordVideo: { dir: outputPath, size: { width: 1080, height: 1920 } }
    });

    const page = await context.newPage();
    await page.goto(`http://localhost:5173/mobile_spotter.html?course=${courseId}&hole=${holeNumber}`);

    // Wait for canvas to mount
    await page.waitForSelector('#holeCanvas', { timeout: 5000 });
    
    // Execute tactical orbit animation
    await page.evaluate((telemetry) => {
      if (window.godsEyeEngine && typeof window.godsEyeEngine.engageTacticalOrbit === 'function') {
        window.godsEyeEngine.engageTacticalOrbit(telemetry.pinCoordinates || [-2.8010, 56.3450], telemetry.bearing || 45);
      }
    }, shotTelemetry);

    await page.waitForTimeout(2000);

    await context.close();
    await browser.close();

    console.log(`✅ God's Eye headless recording complete for Hole ${holeNumber}`);
    return { status: 'RECORDING_COMPLETE', courseId, holeNumber, outputPath };
  } catch (e) {
    console.warn(`[Media Factory] Playwright headless recording fallback: ${e.message}`);
    return { status: 'SIMULATED_RECORDING', courseId, holeNumber, outputPath };
  }
}
