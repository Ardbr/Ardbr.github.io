document.addEventListener('DOMContentLoaded', () => {
    
    let frameCount = 0;
    let lastTime = performance.now();
    $leftsizeFpsTextEle = document.getElementById('leftside-fps-text')

    function updateFPS() {
        const currentTime = performance.now();
        frameCount++;
        // print the frameCount every second
        if (currentTime - lastTime >= 1000) {
            $leftsizeFpsTextEle.innerText = `FPS: ${frameCount}`
            frameCount = 0; // reset
            lastTime = currentTime; // update
        }

        requestAnimationFrame(updateFPS); // request the next frame
    }

    // begin
    requestAnimationFrame(updateFPS);
})