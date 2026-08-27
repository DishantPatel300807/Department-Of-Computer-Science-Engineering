
(function () { // IIFE Private Bubble. Variables created inside won't effect the code outside of the bubble
    let lastScrollTime = 0;
    const coolDownDelay = 100; // Duration between two scrolls so animation does not get gliched if scrolled too fast.
    const anim_dur = 600; // Time line of animation

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
        page.forEach((el) => {
            el.style.transition = 'none';
        });

        page.forEach((el, i) => {
            clearStateClasses(el);
            if (i === index) {
                el.classList.add('is-current');
            } else if (i === index - 1 || (index === 0 && i === page.length - 1)) {
                el.classList.add('is-prev');
            } else {
                el.classList.add('is-next');
            }
        });

        void page[0].offsetWidth; // Force layout

        page.forEach((el) => {
            el.style.transition = '';
        });
    }

    function transitionTo(nextIndex, onComplete) {
        if (isAni || nextIndex == currentIndex) {
            return; // This line tells the sccript not to do anything when the animation is happening, or we are out of slides
        }

        clearTimeout(idleTimer);
        isAni = true;

        let goingforward = nextIndex > currentIndex;
        if (currentIndex === 0 && nextIndex === page.length - 1) goingforward = false; // If scrolled back from 1st slide, makes the animation reverse
        if (currentIndex === page.length - 1 && nextIndex === 0) goingforward = true; // If scrolled forward from last slide, it makes the animation in forward direction
        const outgoing = page[currentIndex];
        const incoming = page[nextIndex];

        incoming.style.transition = 'none';

        if (goingforward) {
            incoming.classList.remove('is-prev');
            incoming.classList.add('is-next');
        } else {
            incoming.classList.remove('is-next');
            incoming.classList.add('is-prev');
        }

        void incoming.offsetWidth; // Tells the browser not to ruin the animation.
        incoming.style.transition = '';

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
        const timeDiff = currentTime - lastScrollTime;
        lastScrollTime = currentTime; // Update timer on EVERY scroll event

        if (timeDiff < coolDownDelay) { 
            return; // Ignore inertia wheel events that happen too fast
        }
        
        if (isAni) return;

        const direction = deltaY > 0 ? 1 : -1; // Down scroll = +1, Up scroll = -1
        let nextIndex = currentIndex + direction; 

        if (nextIndex < 0) {
            nextIndex = page.length - 1; // If scrolled past the first slide, it will loop the last slide
        } else if (nextIndex >= page.length) {
            nextIndex = 0; // If scrolled past the last slide, it will loop the first slide.
        }

        transitionTo(nextIndex);
        }

    window.addEventListener('wheel', (e) => {
        e.preventDefault(); // Stops the page from scrolling normally up and down.
        handleScrollDelta(e.deltaY); // Passing the scroll information to handleScrollDelta
    }, {passive : false});

    settleLayout(0); // This lets the slide one to bee seen first when loading the page for the first time
})();