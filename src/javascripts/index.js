import VideoSnapScroll from "./videoSnapScroll.js";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

// Event listener to perform actions after the loader has faded out
document.addEventListener('loaderFadedOut', (event) => {
    console.log(event.detail.message); // Output: 'Loader has faded out'
    console.log('Event triggered at:', event.detail.timestamp);
});

document.querySelector('.presentation-container').addEventListener('touchstart', () => {
    console.log('Touch start event detected after slide change');
});

document.addEventListener('touchstart', (event) => {
    console.log('Touched element:', event.target);
    console.log('Is element in DOM:', document.contains(event.target));
});

// Play the animation when the document is ready
document.addEventListener("DOMContentLoaded", function () {
    const vidSnapScroll = new VideoSnapScroll({
        srcDesktop: '../video/compressed_default-wide.mp4',
        srcMobile: '../video/compressed_default-tall.mp4',
        breakpoint: 992,
        loadingOverlay: document.querySelector('.loading-overlay'),
        enableSectionFadeIn: true,
        forceSkipFade: false,
        frameGap: 0,
        easing: 'ease',
        navContainer: true,
        prevButton: ".nav-prev",
        nextButton: ".nav-next",
        enableNavAnimation: false,
        loadingOverlay: '.loading-overlay',
        loadingText: '.loading-text',
        useLottieLoader: false,
        lottieLoaderPath: '../lottie/loader.json',
    });

    // Check the screen width and log the appropriate video source
    const checkVideoSource = () => {
        const windowWidth = window.innerWidth;
        console.log(vidSnapScroll)
        if (windowWidth > vidSnapScroll.breakpoint) {
            console.log('Using desktop video source:', vidSnapScroll.options.srcDesktop);
        } else {
            console.log('Using mobile video source:', vidSnapScroll.options.srcMobile);
        }
    };

    // Call the function initially to log the current source
    checkVideoSource();


    // Assign the VideoSnapScroll instance to a global variable
    window.videoScrollInstance = vidSnapScroll;

    vidSnapScroll.updateLoaderProgress();

    document.addEventListener('slideChangeStart', (event) => {
        console.log('Slide change started:', event.detail);
    });

    document.addEventListener('slideChangeEnd', (event) => {
        console.log('Slide change ended:', event.detail);

    });

    function handleTouchStart(event) {
        console.log('Button touched:', event.target);
    }
});
