
(function () {
    const anim_dur = 100;
    const scroll_threshold = 350;
    const accumulator_clamp = 600;

    const state_classes = [
        'is-current',
        'is-next',
        'is-prev',
    ];

    let idleTimer = null;
    let isAni = false;
    let currentIndex = 0;
    let scrollAccumulator = 0;

    const page = Array.from(document.querySelectorAll('.bg-carousel'));

    function clearStateClasses(page) {
        state_classes.forEach((cls) => page.classList.remove(cls));
    }

    function settleLayout(index) {
        page.forEach(clearStateClasses);
        page[index].classList.add('is-current');
        if (index + 1 < page.length) {
            page[index + 1].classList.add('is-next');
        }
    }

    function transitionTo(nextIndex, onComplete) {
        if (nextIndex == currentIndex || nextIndex < 0 || nextIndex >= page.length) {
            return;
        }

        clearTimeout(idleTimer);
        isAni = true;

        const goingforward = nextIndex > currentIndex;
        const outgoing = page[currentIndex];
        const incoming = page[nextIndex];

        if (goingforward) { // if the user scrolls down, the code inside the bracket runs
            incoming.classList.remove('is-next'); // This page is currently assigned the is-next class. This line removes it from waiting stage and brings it in ready to move

            outgoing.classList.remove('is-current', 'is-next'); // is-current page is still visible, so this line strips away that page from active status.
        } else {
            incoming.classList.remove('is-current', 'is-next');
            incoming.classList.add('is-current');

            outgoing.classList.remove('is-current', 'is-next');  
        }

        currentIndex = nextIndex;

        setTimeout(() => {
            isAni = false;
            settleLayout(currentIndex);
            if (onComplete) onComplete();
        }, anim_dur);
    }

    function handleScrollDelta(deltaY) {
        if (isAni) return;

        scrollAccumulator += deltaY;
        scrollAccumulator = Math.max(
            -accumulator_clamp,
            Math.min(accumulator_clamp, scrollAccumulator)
        );
        if (Math.abs(scrollAccumulator) >= scroll_threshold) {
            const direction = scrollAccumulator > 0 ? 1 : -1;
            const nextIndex = currentIndex + direction;

            if (nextIndex >= 0 && nextIndex < page.length) {
                transitionTo(nextIndex);
            }
            scrollAccumulator = 0;
        }
    }

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        handleScrollDelta(e.deltaY);
    }, {passive : false});
})();