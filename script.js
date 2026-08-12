
(function () { // IIFE Private Bubble. Variables created inside won't effect the code outside of the bubble
    let lastScrollTime = 0;
    const coolDownDelay = 5; // Duration between two scrolls so animation does not get gliched if scrolled too fast.
    const anim_dur = 600;

    const state_classes = [
        'is-current',
        'is-next',
        'is-prev',
    ];

    let idleTimer = null;
    let isAni = false;
    let currentIndex = 0;

    const page = Array.from(document.querySelectorAll('.bg-carousel')); // This finds 4 div elements and puts them in a list.

    function clearStateClasses(el) {
        state_classes.forEach((cls) => el.classList.remove(cls));
    }

    function settleLayout(index) {
        page.forEach((el, i) => {
            clearStateClasses(el);
            if (i === index) {
                el.classList.add('is-current');
            } else if (i > index) {
                el.classList.add('is-next');
            } else if (i < index) {
                el.classList.add('is-prev');
            }
        });
    }

    function transitionTo(nextIndex, onComplete) {
        if (isAni || nextIndex == currentIndex || nextIndex < 0 || nextIndex >= page.length) {
            return; // This line tells the sccript not to do anything when the animation is happening, or we are out of slides
        }

        clearTimeout(idleTimer);
        isAni = true;

        const goingforward = nextIndex > currentIndex;
        const outgoing = page[currentIndex];
        const incoming = page[nextIndex];

        if (goingforward) { // if the user scrolls down, the code inside the bracket runs
            // Slide the new slide in and push the old to the left.
            incoming.classList.add('is-current');
            incoming.classList.remove('is-next'); // This page is currently assigned the is-next class. This line removes it from waiting stage and brings it in ready to move
            
            outgoing.classList.add('is-prev');
            // Push the old one to the right.
            outgoing.classList.remove('is-current'); // is-current page is still visible, so this line strips away that page from active status.
        } else {
            incoming.classList.add('is-current');
            incoming.classList.remove('is-prev');

            outgoing.classList.add('is-next');
            outgoing.classList.remove('is-current');  
        }

        currentIndex = nextIndex; // Updates our memory to the new index number

        setTimeout(() => {
            isAni = false; // Animation is done
            settleLayout(currentIndex);
            if (onComplete) onComplete();
        }, anim_dur);
    }

    function handleScrollDelta(deltaY) {
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < coolDownDelay) {
            return; // When scrolled just after a slide change, it ignores the scroll
        }

        const direction = deltaY > 0 ? 1 : -1; // Down scroll = +1, Up scroll = -1
        const nextIndex = currentIndex + direction; 

        if (nextIndex >= 0 && nextIndex < page.length) {
            transitionTo(nextIndex); // Calling the function of slide change

            lastScrollTime = currentTime; // Resetting the timer.
        }

        }

    window.addEventListener('wheel', (e) => {
        e.preventDefault(); // Stops the page from scrolling normally up and down.
        handleScrollDelta(e.deltaY); // Passing the scroll information to handleScrollDelta
    }, {passive : false});

    settleLayout(0); // This lets the slide one to bee seen first when loading the page for the first time
})();