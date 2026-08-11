
(function () {
    let lastScrollTime = 0;
    const coolDownDelay = 1500;
    const anim_dur = 1;

    const state_classes = [
        'is-current',
        'is-next',
        'is-prev',
    ];

    let idleTimer = null;
    let isAni = false;
    let currentIndex = 0;

    const page = Array.from(document.querySelectorAll('.bg-carousel'));

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
            return;
        }

        clearTimeout(idleTimer);
        isAni = true;

        const goingforward = nextIndex > currentIndex;
        const outgoing = page[currentIndex];
        const incoming = page[nextIndex];

        if (goingforward) { // if the user scrolls down, the code inside the bracket runs
            incoming.classList.add('is-current');
            incoming.classList.remove('is-next'); // This page is currently assigned the is-next class. This line removes it from waiting stage and brings it in ready to move
            
            outgoing.classList.add('is-prev');
            outgoing.classList.remove('is-current'); // is-current page is still visible, so this line strips away that page from active status.
        } else {
            incoming.classList.add('is-current');
            incoming.classList.remove('is-prev');

            outgoing.classList.add('is-next');
            outgoing.classList.remove('is-current');  
        }

        currentIndex = nextIndex;

        setTimeout(() => {
            isAni = false;
            settleLayout(currentIndex);
            if (onComplete) onComplete();
        }, anim_dur);
    }

    function handleScrollDelta(deltaY) {
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < coolDownDelay) {
            return;
        }

        const direction = deltaY > 0 ? 1 : -1;
        const nextIndex = currentIndex + direction; 

        if (nextIndex >= 0 && nextIndex < page.length) {
            transitionTo(nextIndex);

            lastScrollTime = currentTime;
        }

        }

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        handleScrollDelta(e.deltaY);
    }, {passive : false});

    settleLayout(0);
})();