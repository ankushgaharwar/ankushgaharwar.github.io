const divider = document.getElementById('divider');
let isDown = false;
let startX, startWidthLeft, startWidthRight;

divider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX;
    startWidthLeft = window1.offsetWidth;
    startWidthRight = window2.offsetWidth;
    divider.classList.add('active');
});

document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const move = e.clientX - startX;
    let newLeftWidth = startWidthLeft + move;
    let newRightWidth = startWidthRight - move;

    // Constraints to prevent the divider from going too far to either side
    if(newLeftWidth < 300) newLeftWidth = 300;
    if(newRightWidth < 300) newRightWidth = 300;

    window1.style.width = `${newLeftWidth}px`;
    window2.style.width = `${newRightWidth}px`;
});

document.addEventListener('mouseup', () => {
    isDown = false;
    divider.classList.remove('active');
});













const window1 = document.getElementById('window1');
const window2 = document.getElementById('window2');

window1.addEventListener('mouseenter', () => {
    window1.style.width = "80%";
    window2.style.width = "20%";
});

window2.addEventListener('mouseenter', () => {
    window1.style.width = "20%";
    window2.style.width = "80%";
});

// Optional: Reset to default sizes when the mouse leaves the container area
const container = document.querySelector('.container'); // Assuming the container holds both windows
container.addEventListener('mouseleave', () => {
    window1.style.width = "50%"; // Reset to initial sizes or 50% if you prefer equal sizes
    window2.style.width = "50%";
});
