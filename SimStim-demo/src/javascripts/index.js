import VideoSnapScroll from "./videoSnapScroll.js";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import Venobox from 'venobox';
import 'venobox/dist/venobox.css';
import Blobity from './blobity/lib/blobity.js';
// import 'social-share-kit/dist/css/social-share-kit.css';
import SocialShareKit from 'social-share-kit';

gsap.registerPlugin(ScrollToPlugin);

// Add this function at the beginning of your script
// Custom GSAP animation for slide 1

//  GSAP animation for slide 1
window.slide1 = function ($slide) {

    const texts = $slide.querySelectorAll('.hero__text');
    const timeline = gsap.timeline({ delay: 0.5 });
    timeline.fromTo(texts[0], { opacity: 0, y: '125%' }, { opacity: 1, y: '5%', duration: 1.75, ease: "power2.out" });

    return timeline; // Return the timeline so it can be tracked
};

//  GSAP  for slide 2
window.slide2 = function ($slide) {
    // console.log($slide)
    const texts = $slide.querySelectorAll('.slide__2__text');
    const timeline = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
            console.log('Animation 2 complete');
        }
    });

    texts.forEach((text, i) => {
        // Animate each text element to fade in and move to 5% Y
        timeline.fromTo(text,
            { opacity: 0, y: '125%' },
            { opacity: 1, y: '5%', duration: 1.75, ease: "power2.out" }
        );

        // If it's not the last text, animate it out (fade out and move upwards)
        if (i < texts.length - 1) {
            timeline.to(text,
                { opacity: 0, y: '-50%', duration: 1.75, ease: "power2.in" },
                "-=0.5" // Overlap the next animation
            );
        }
    });

    // Ensure the last element stays at opacity 1 and Y 5 % without fading out
    const lastText = texts[texts.length - 1];
    timeline.set(lastText, { opacity: 1, y: '5%' });

    return timeline; // Return the timeline so it can be tracked
};

window.slide3 = function ($slide) {

    const timeline = gsap.timeline({ delay: 0.5 });


    timeline.fromTo("#slide-3 .lower-text",
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1 }); // Animate first text
    return timeline; // Return the timeline so it can be tracked
};


//  GSAP  for slide 5
window.slide5 = function ($slide) {
    const timeline = gsap.timeline();
    // Set the initial state of the spans to be fully clipped (hidden)
    timeline.set("#slide-5 .clipping.one, #slide-5 .clipping.two", { clipPath: "inset(0 100% 0 0)" })
    timeline.set("#slide-5 .gradient-text", { opacity: 0 })
        // Add a delay before starting the animations
        .to({}, { duration: 2 })
        // Animate to reveal first text
        .to("#slide-5 .gradient-text", { opacity: 1, duration: .5, ease: "power1.out" })
        .to("#slide-5 .clipping.one", { clipPath: "inset(0 0% 0 0)", duration: .75, ease: "power2.out" }, "-=0.3")
        // Animate to reveal second text with a delay
        .to("#slide-5 .clipping.two", { clipPath: "inset(0 0% 0 0)", duration: .75, ease: "power2.out" }, "-=0.1");
    return timeline;
};

//  GSAP  for slide 6
window.slide6 = function ($slide) {
    const timeline = gsap.timeline({ delay: 0.5 });

    // Animate the .stats elements with a stagger between each one
    timeline.fromTo(
        "#slide-6 .stats",
        { xPercent: -30, opacity: 0 },  // Start: moved down 60% and invisible
        { xPercent: 0, opacity: 1, duration: 1, stagger: 0.3 }  // End: original position and visible, staggered by 0.3s
    );

    return timeline;  // Return the timeline for tracking or further chaining
};

//  GSAP  for slide 8
window.slide8 = function ($slide) {
    const timeline = gsap.timeline();
    // Set the initial state of the spans to be fully clipped (hidden)
    timeline.set("#slide-8 .clipping.one, #slide-8 .clipping.two", { clipPath: "inset(0 100% 0 0)" })
    timeline.set("#slide-8 .gradient-text", { opacity: 0 })
    timeline.set("#slide-8 p", { opacity: 0, yPercent: 10 })
        // Add a delay before starting the animations
        .to({}, { duration: 1.5 })
        // Animate to reveal first text
        .to("#slide-8 .gradient-text", { opacity: 1, duration: .75, ease: "power1.out" })
        .to("#slide-8 .clipping.one", { clipPath: "inset(0 0% 0 0)", duration: .75, ease: "power2.out" }, "-=0.5")
        // Animate to reveal second text with a delay
        .to("#slide-8 .clipping.two", { clipPath: "inset(0 0% 0 0)", duration: .75, ease: "power2.out" }, "-=0.5")
        .to("#slide-8 p", { opacity: 1, yPercent: 0, duration: .75, duration: .75, ease: "power2.out" }, "-=0.5");
    return timeline;
};

//  GSAP  for slide 9
window.slide9 = function ($slide) {
    const timeline = gsap.timeline();
    // Set the initial state of the spans to be fully clipped (hidden)
    timeline.set("#slide-9 p", { opacity: 0, yPercent: 10 })
        // Add a delay before starting the animations
        .to({}, { duration: 1.25 })
        .to(
            "#slide-9 p",
            { yPercent: 0, opacity: 1, duration: 1, stagger: 0.3 }  // End: original position and visible, staggered by 0.3s
        );
    return timeline;
};

//  GSAP  for slide 12
window.slide12 = function ($slide) {
    const timeline = gsap.timeline();
    // Set the initial state of the spans to be fully clipped (hidden)
    timeline.set("#slide-12 .clipping.one, #slide-12 .clipping.two", { clipPath: "inset(0 100% 0 0)" })
        // Add a delay before starting the animations
        .to({}, { duration: 2 })
        // Animate to reveal first text
        .to("#slide-12 .clipping.one", { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power2.out" }, "-=0.5")
        // Animate to reveal second text with a delay
        .to("#slide-12 .clipping.two", { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power2.out" }, "-=0.5")

    return timeline;
};

//  GSAP  for slide 13
window.slide13 = function ($slide) {
    const timeline = gsap.timeline();
    timeline.set("#slide-13 h1 span", { yPercent: 20, opacity: 0 })
        .set("#slide-13 p", { yPercent: 10, opacity: 0 })
        .to({}, { duration: 2 })
        .to(
            "#slide-13 h1 span",  // Start: moved down 60% and invisible
            { yPercent: 0, opacity: 1, duration: 1, stagger: 0.4 }  // End: original position and visible, staggered by 0.3s
        )
        .to(
            "#slide-13 p",  // Start: moved down 60% and invisible
            { yPercent: 0, opacity: 1, duration: 1 }, "-=0.5"  // End: original position and visible, staggered by 0.3s
        );
    return timeline;
};


// Loader Fade out functions to call first animation #slide-1
document.addEventListener('loaderFadedOut', (event) => {
    console.log(event.detail.message); // Output: 'Loader has faded out'
    console.log('Event triggered at:', event.detail.timestamp);

    gsap.fromTo("#slide-1 .hero__text",
        { opacity: 0, y: '125%' },
        {
            opacity: 1,
            y: '5%',
            duration: 3,
            ease: "power2.out",
            onComplete: () => {

            }
        }
    );


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

    // Assuming your logo has an ID of #logo
    const logo = document.getElementById('logo-svg');

    logo.addEventListener('click', function () {
        // Access the global instance and use goToSlide to navigate to the first slide
        const firstSlide = document.querySelector('#slide-1'); // Assuming your slides have a class of "slide"
        if (firstSlide) {
            window.videoScrollInstance.goToSlide(firstSlide);
        }
    });

    const cta = document.getElementById('headerCta');

    cta.addEventListener('click', function () {
        // Access the global instance and use goToSlide to navigate to the first slide
        const lastSlide = document.querySelector('#slide-15'); // Assuming your slides have a class of "slide"
        if (lastSlide) {
            window.videoScrollInstance.goToSlide(lastSlide);
        }
    });

    document.addEventListener('slideChangeStart', (event) => {
        console.log('Slide change started:', event.detail);
        // Your code here
    });

    document.addEventListener('slideChangeEnd', (event) => {
        console.log('Slide change ended:', event.detail);

    });

    function handleTouchStart(event) {
        console.log('Button touched:', event.target);
    }

    const modal = new Venobox({
        selector: '.modal',
        onContentLoaded: function () {

            // Log to confirm modal content loaded
            console.log('Modal content loaded.');

            // Select all buttons with a data-display attribute inside the modal
            const buttons = document.querySelectorAll('.vbox-content button[data-display]');

            // Select the navigation area
            const nav = document.querySelector('.presentation-next-prev');

            // Check if navigation area exists
            if (nav) {
                // Loop through each button and add a click event listener
                buttons.forEach(button => {
                    button.addEventListener('click', () => {
                        // Get the data-display value from the clicked button
                        const displayValue = button.getAttribute('data-display');
                        document.body.classList.toggle('top-nav', displayValue === 'top');
                        // Update the data-display attribute on the nav element
                        nav.setAttribute('data-display', displayValue);
                        // Close the modal
                        modal.close();
                    });
                });
            }

            // Hover state
            buttons.forEach(button => {
                button.addEventListener("mouseenter", function () {
                    // Add the animated class on hover
                    this.classList.add("animated");
                });

                button.addEventListener("animationend", function () {
                    // Remove the animated class once the animation ends
                    this.classList.remove("animated");
                });
            });

            // Initialize Social Sharing for Buttons Inside Modal using event delegation
            document.querySelector('.vbox-content').addEventListener('click', function (e) {
                const target = e.target.closest('a'); // Ensure we're targeting anchor elements

                if (target && target.classList.contains('ssk-twitter')) {
                    e.preventDefault(); // Prevent default link behavior
                    console.log('Twitter button clicked'); // Debugging log
                    const urlToShare = 'https://www.fictiontribe.com/'; // The URL you want to share
                    const tweetText = 'Check this out!';
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(urlToShare)}&text=${encodeURIComponent(tweetText)}`, '_blank');
                }

                if (target && target.classList.contains('ssk-facebook')) {
                    e.preventDefault();
                    console.log('Facebook button clicked'); // Debugging log
                    const urlToShare = 'https://www.fictiontribe.com/'; // The URL you want to share
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`, '_blank');
                }

                if (target && target.classList.contains('ssk-linkedin')) {
                    e.preventDefault();
                    console.log('LinkedIn button clicked'); // Debugging log
                    const urlToShare = 'https://www.fictiontribe.com/'; // The URL you want to share
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}`, '_blank');
                }
            });
        }
    });

    const links = document.querySelectorAll('a, button');

    // MAKE SURE TO ADD YOUR LICENSE KEY HERE
    const options = {
        color: '#F7CB11',
        opacity: 1,
        invert: true,
        dotColor: '#72A8FF',
        mode: 'bouncy'
    };
    const blobity = new Blobity(options);

    const startSwitchingColors = () => {
        blobity.updateOptions({ color: '#F7CB11', dotColor: '#F04E3F', opacity: 0.05 });
    };
    const stopSwitchingColors = () => {
        blobity.updateOptions({ color: options.color, dotColor: options.dotColor, opacity: options.opacity });
    };

    links.forEach(el => {
        // Check if the element has the exclude class, skip adding event listeners if it does
        if (!el.classList.contains('exclude-blobity')) {
            el.addEventListener('mouseenter', startSwitchingColors);
            el.addEventListener('mouseleave', stopSwitchingColors);
        }
    });

});
