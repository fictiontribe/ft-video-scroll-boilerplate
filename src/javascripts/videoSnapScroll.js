import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import lottie from 'lottie-web';
import AlloyFinger from 'alloyfinger';

gsap.registerPlugin(ScrollToPlugin);

/**
 * VideoSnapScroll class for managing a full-page scrolling presentation with video synchronization.
 */
export default class VideoSnapScroll {
  /**
   * @param {Object} options - Configuration options for the VideoSnapScroll instance.
   */
  constructor(options = {}) {
    this.navigationEnabled = false;
    this.eventDispatched = false;
    this.options = Object.assign({
      srcDesktop: '',
      srcMobile: '',
      breakpoint: 991,
      sectionContainer: 'section',
      container: 'body',
      scrollContainer: 'body',
      videoContainer: '#backgroundVideo',
      enableSectionFadeIn: false,
      forceSkipFade: false,
      frameGap: 0.1,
      easing: 'ease',
      navContainer: true,
      prevButton: ".nav-prev",
      nextButton: ".nav-next",
      enableNavAnimation: true,
      loadingOverlay: '.loading-overlay',
      loadingText: '.loading-text',
      useLottieLoader: false,
      lottieLoaderPath: '',
      lottieAnimationPath: '',
      autoScrollToggleId: 'toggle',
      defaultAutoScrollTime: 4000,
      progressBarSelector: '.progress-bar',
    }, options);

    // Initialize properties
    this.$window = window;
    this.$document = document;
    this.$presentationContainer = document.querySelector(".presentation-container");
    this.$slides = Array.from(document.querySelectorAll(this.options.sectionContainer));
    this.$navButtons = [];
    this.$currentSlide = this.$slides[0];
    this.isAnimating = false;
    this.pageHeight = this.$window.innerHeight;
    this.keyCodes = { UP: 38, DOWN: 40 };
    this.video = document.querySelector(this.options.videoContainer);
    this.isMobile = this.$window.innerWidth < this.options.breakpoint;
    this.positions = [];
    this.retryCount = 0;
    this.isPlaying = false;
    this.loopVideoHandler = null;
    this.transitionVideoHandler = null;
    this.$loadingOverlay = this.getElement(this.options.loadingOverlay);
    this.loaderAnimation = null;
    this.$loadingText = this.getElement(this.options.loadingText, this.$loadingOverlay);
    this.slideAnimations = {};
    this.onNavButtonClick = this.onNavButtonClick.bind(this);
    // Header element to update
    this.$header = document.querySelector('header[data-header]');
    this.$footer = document.querySelector('footer[data-footer]');
    this.autoScrollInterval = null;
    this.progressBarAnimation = null;
    this.$progressBar = document.querySelector(this.options.progressBarSelector);
    this.$toggleCheckbox = document.getElementById(this.options.autoScrollToggleId);
    this.initAutoScrollToggle();
    this.addTouchListeners();

    this.slideChangeStartEvent = new CustomEvent('slideChangeStart', {
      bubbles: true,
      cancelable: true,
      detail: { slideIndex: null, direction: null }
    });

    this.slideChangeEndEvent = new CustomEvent('slideChangeEnd', {
      bubbles: true,
      cancelable: true,
      detail: { slideIndex: null }
    });

    this.init();
  }


  /**
   * Initialize touch event listeners for swipe navigation using AlloyFinger.
   */
  addTouchListeners() {
    const swipeHandler = new AlloyFinger('html', {
      swipe: (event) => {
        console.log('Swipe event:', event);
        if (event.direction === 'Up') {
          this.goToNextSlide();  // Navigate to the next slide
        } else if (event.direction === 'Down') {
          this.goToPrevSlide();  // Navigate to the previous slide
        }
      }
    });

    // Log to check if AlloyFinger is initialized correctly
    console.log('AlloyFinger swipe detection initialized.');
  }

  enableNavigation() {
    this.navigationEnabled = true;
    console.log('Navigation is now enabled.');
  }
  /**
   * Get an element using a selector or return the element if it's already an HTMLElement.
   * @param {string|HTMLElement} selector - The selector or element.
   * @param {Document|HTMLElement} parent - The parent element to search within.
   * @returns {HTMLElement|null} The found element or null.
   */
  getElement(selector, parent = document) {
    if (typeof selector === 'string') {
      return parent.querySelector(selector);
    } else if (selector instanceof HTMLElement) {
      return selector;
    }
    console.error(`Invalid selector or element: ${selector}`);
    return null;
  }

  /**
   * Initialize Lottie animations for slides that have them.
   */
  initializeSlideLotties() {
    this.$slides.forEach(slide => {
      const lottiePath = slide.dataset.lottiePath;
      if (lottiePath) {
        const lottieContainer = slide.querySelector('.lottie-animation-container');
        if (lottieContainer) {
          const animation = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: slide.dataset.lottieLoop === 'true',
            autoplay: false,
            path: lottiePath
          });
          this.slideAnimations[slide.id] = animation;
        }
      }
    });
  }

  /**
   * Initialize the VideoSnapScroll instance.
   */
  init() {
    this.updateLoaderProgress(); // Show loader first
    this.hasInitialHash = window.location.hash !== '';
    this.initialSlideId = this.hasInitialHash ? window.location.hash.replace('#', '') : null;

    // Delay other initializations
    setTimeout(() => {
      this.setupPositions();
      if (this.options.navContainer) {
        this.createNavContainer();
      }
      this.addEventListeners();
      this.initializeSlides();
      this.loadVideo();
      this.onResize();
      this.centerActiveLink(true);
      this.initializeSlideLotties();
      const hash = window.location.hash;
      if (hash) {
        const slideId = hash.replace('#', '');
        const targetSlide = document.getElementById(slideId);
        if (targetSlide) {
          this.goToSlide(targetSlide); // Navigate to the slide if it exists
        }
      }
    }, 100);
  }

  /**
    * Set up the positions for each slide based on their attributes.
    */
  setupPositions() {
    this.$slides.forEach((section, index) => {
      this.positions.push({
        forward: this.convertTimeRange([
          section.getAttribute('data-transition-start') || '00:00:00',
          section.getAttribute('data-transition-end') || '00:00:00',
          !(section.getAttribute('data-transition-start') === section.getAttribute('data-transition-end')),
        ]),
        now: this.convertTimeRange([
          section.getAttribute('data-loop-start') || '00:00:00',
          section.getAttribute('data-loop-end') || '00:00:00',
          !(section.getAttribute('data-loop-start') === section.getAttribute('data-loop-end')),
        ]),
        back: this.convertTimeRange([
          section.getAttribute('data-transition-start-backward') || '00:00:00',
          section.getAttribute('data-transition-end-backward') || '00:00:00',
          !(section.getAttribute('data-transition-start-backward') === section.getAttribute('data-transition-end-backward')),
        ]),
      });
    });
  }

  /**
   * Convert time string to seconds.
   * @param {string} time - Time string in format "HH:MM:SS".
   * @returns {number} Time in seconds.
   */
  convertTime(time) {
    const parts = time ? time.split(':') : ['00', '00', '00'];
    return Math.max((parseInt(parts[0]) * 60) + parseInt(parts[1]) + (parseInt(parts[2]) * (1 / 30)), .01);
  }

  /**
   * Convert time range and apply frame gap.
   * @param {Array} timeRange - Array containing start time, end time, and boolean flag.
   * @returns {Array} Converted time range with frame gap applied.
   */
  convertTimeRange(timeRange) {
    return [
      parseFloat((this.convertTime(timeRange[0]) + this.options.frameGap).toFixed(3)),
      parseFloat((this.convertTime(timeRange[1]) - this.options.frameGap).toFixed(3)),
      timeRange[2],
    ];
  }

  /**
   * Create the navigation container and buttons.
   */
  createNavContainer() {
    const navContainer = document.createElement("nav");
    navContainer.classList.add("presentation-navigation");
    navContainer.classList.add("no-touch");

    this.$navButtons.forEach((btn, index) => {
      btn.addEventListener("click", this.onNavButtonClick);
    });

    this.$slides.forEach((slide, index) => {
      const navButton = document.createElement("button");
      navButton.classList.add("nav-button");

      // Get the data-nav-title attribute
      const navTitle = slide.getAttribute('data-nav-title');

      // If navTitle exists but is empty, create an empty button
      if (navTitle !== null && navTitle.trim() === "") {
        navButton.textContent = "";
      } else {
        // Use the navTitle if it's not empty, otherwise fallback to the h1 or index-based title
        navButton.innerHTML = `<span>${navTitle}</span> ` || this.getSlideTitle(slide) || `Section ${index + 1}`;
      }

      navButton.addEventListener("click", () => this.goToSlide(slide));
      navContainer.appendChild(navButton);
      this.$navButtons.push(navButton);
    });

    document.body.appendChild(navContainer);

    // Set the first navigation button to active
    if (this.$navButtons.length > 0) {
      this.$navButtons[0].classList.add("active");
    }
  }
  /**
   * Get the title of a slide.
   * @param {HTMLElement} slide - The slide element.
   * @returns {string|null} The slide title or null if not found.
   */
  getSlideTitle(slide) {
    const h1 = slide.querySelector('h1');
    return h1 ? h1.textContent.trim() : null;
  }


  /**
  * Add event listeners for various user interactions.
  */
  addEventListeners() {
    this.$window.addEventListener("resize", this.onResize.bind(this));
    this.$window.addEventListener("wheel", this.onMouseWheel.bind(this), { passive: false });
    this.$document.addEventListener("keydown", this.onKeyDown.bind(this));

    const $navPrev = document.querySelector(this.options.prevButton);
    if ($navPrev) $navPrev.addEventListener("click", () => this.goToPrevSlide());

    const $navNext = document.querySelector(this.options.nextButton);
    if ($navNext) $navNext.addEventListener("click", () => this.goToNextSlide());

    this.$navButtons.forEach(btn => btn.addEventListener("click", this.onNavButtonClick.bind(this)));
  }

  /**
   * Initialize slides by setting their positions and opacity.
   */
  initializeSlides() {
    this.$slides.forEach((slide, index) => {
      slide.dataset.index = index;
      slide.style.position = 'absolute';
      slide.style.opacity = index === 0 ? 1 : 0;
      slide.style.left = 0;
      slide.style.top = 0;
      if (index === 0) {
        slide.classList.add("active");
        gsap.set(slide, { opacity: 1 });
      }
    });
  }

  /**
   * Load and play the background video.
   */
  loadVideo() {
    if (!this.video) {
      console.error('Video element not found');
      return;
    }

    const videoSrc = this.isMobile ? this.options.srcMobile : this.options.srcDesktop;
    if (!videoSrc) return;

    this.video.src = videoSrc;
    this.video.load();

    // Pause the video to prevent autoplay on load
    this.video.pause();

    // Ensure video is ready to play
    this.video.addEventListener('loadeddata', () => {
      console.log('Video data loaded');
    });

    this.video.addEventListener('canplaythrough', () => {
      console.log('Video can play through');
      this.videoReady = true; // Set flag to indicate video is ready to play
    });

    this.video.addEventListener('play', () => console.log('Video is playing'));
    this.video.addEventListener('pause', () => console.log('Video is paused'));
    this.video.addEventListener('error', (e) => console.error('Video error:', e));

    // Play video only after loader has faded out and video is ready
    document.addEventListener('loaderFadedOut', () => {
      console.log('loaderFadedOut event received');
      document.querySelector(".presentation-navigation").classList.remove("no-touch");

      // If video is ready and not playing
      if (this.videoReady && !this.isPlaying) {
        if (this.hasInitialHash && this.initialSlideId && this.initialSlideId !== 'slide-1') {
          // Handle case where hash is for a slide after the first slide
          const targetSlide = document.getElementById(this.initialSlideId);
          if (targetSlide) {
            console.log(`Navigating to initial slide ${this.initialSlideId} and syncing video.`);
            this.goToSlide(targetSlide, 'down', true); // Navigate and sync video
          }
        } else {
          // Fallback for when there is no hash or the hash is for the first slide
          console.log('Playing initial video for the first slide or ignoring hash for slide-1.');
          this.playInitialVideo();
        }

        // Enable slide navigation after some delay
        setTimeout(() => {
          this.enableNavigation();

          // **Reattach event listeners**
          // this.attachModalButtonListeners();  // Reattach modal button listeners
          this.enableScrollEvents();  // Re-enable scroll/touch events
          this.addTouchListeners();   // Reattach AlloyFinger or other touch/swipe events

        }, 1000);
      } else {
        console.warn('Video not ready or already playing');
      }
    });
  }


  handleInitialHashNavigation() {
    const targetSlide = document.getElementById(this.initialSlideId);
    if (targetSlide) {
      console.log(`Navigating to initial slide ${this.initialSlideId}`);
      this.goToSlide(targetSlide, 'down', true);  // Pass true for isInitialNavigation
    } else {
      console.warn(`Target slide ${this.initialSlideId} not found, playing initial video`);
      this.playInitialVideo();
    }
  }

  /**
   * Force video playback and handle autoplay issues.
   * @param {HTMLVideoElement} player - The video element to play.
   * @returns {Promise} A promise that resolves when the video starts playing.
   */
  forcePlay(player) {
    const hash = window.location.hash; // Check if there's a hash in the URL
    if (hash && !this.isPlaying) {
      const slideId = hash.replace('#', '');
      const targetSlide = document.getElementById(slideId);
      if (targetSlide) {
        const slideIndex = parseInt(targetSlide.dataset.index);
        const startTime = this.positions[slideIndex].forward[0]; // Get the start time of the target slide
        player.currentTime = Math.max(startTime, .01); // Set the current time of the video to the slide's time
      }
    }

    return new Promise((resolve, reject) => {
      if (this.isPlaying) {
        console.info('Video is already playing');
        resolve(true);
        return;
      }

      player.play()
        .then(() => {
          this.isPlaying = true;
          console.info('Video is playing');
          resolve(true);
        })
        .catch((err) => {
          console.error('Video failed to autoplay:', err);
          if (this.$loadingOverlay) {
            this.$loadingText.innerText = 'Click to Start Video';
          }
          document.body.addEventListener('click', () => {
            if (!this.isPlaying) {
              this.forcePlay(player)
                .then(() => {
                  this.isPlaying = true;
                  resolve(true);
                })
                .catch(err => {
                  reject('Failed to play video after user interaction:', err);
                });
            }
          }, { once: true }); // Ensure it fires only once
        });
    });
  }

  /**
     * Play the initial video for the first slide.
     */
  /**
   * Play the initial video for the first slide.
   */
  playInitialVideo() {
    const firstSlide = this.$slides[0];  // Always handle the first slide
    const pos = this.positions[0].forward;
    const startTime = pos[0];
    const endTime = pos[1];
    const loopStart = this.positions[0].now[0];
    const loopEnd = this.positions[0].now[1];

    // Set video to start at the correct time for the first slide
    this.video.currentTime = Math.max(startTime, .01);

    this.video.play().then(() => {
      console.log('Initial video started successfully');
      const onTimeUpdate = () => {
        console.log(`Current Video Time: ${this.video.currentTime}`);
        if (this.video.currentTime >= endTime) {
          this.video.removeEventListener('timeupdate', onTimeUpdate);
          console.log(`Transition End reached at ${endTime}. Looping from ${loopStart} to ${loopEnd}`);
          this.video.currentTime = Math.max(loopStart, .01);
          this.video.loop = true;  // Set the video to loop mode
          this.video.addEventListener('timeupdate', this.loopVideoHandler = this.loopVideo.bind(this, loopStart, loopEnd));
          this.enableScrollEvents();
        }
      };

      this.video.addEventListener('timeupdate', onTimeUpdate);
    }).catch(err => {
      console.error('Error playing initial video:', err);
      // Fallback to prompt user interaction to play video if autoplay fails
      this.promptVideoPlayFallback();
    });
  }

  promptVideoPlayFallback() {
    if (this.$loadingOverlay) {
      this.$loadingText.innerText = 'Click to Play Video'; // Change loader text
    }

    document.body.addEventListener('click', () => {
      if (!this.isPlaying) {
        this.video.play().then(() => {
          console.log('Video started after user interaction');
        }).catch(playErr => {
          console.error('Error playing video after user interaction:', playErr);
        });
      }
    }, { once: true }); // Only need to listen for one interaction
  }

  /**
   * Handle video looping between specified start and end times.
   * @param {number} loopStart - Loop start time in seconds.
   * @param {number} loopEnd - Loop end time in seconds.
   */
  loopVideo(loopStart, loopEnd) {
    if (this.video.currentTime >= loopEnd) {
      console.log(`Loop End reached at ${loopEnd}. Restarting from ${loopStart}`);
      this.video.currentTime = Math.max(loopStart, .01); // Reset to loop start time
      this.video.play(); // Play the video again from the loop start
    }
  }
  /**
   * Handle window resize event.
   */
  onResize() {
    const newPageHeight = this.$window.innerHeight;
    if (this.pageHeight !== newPageHeight) {
      this.pageHeight = newPageHeight;
      gsap.set([this.$presentationContainer, ...this.$slides], { height: `${this.pageHeight}px` });
      gsap.set(this.$window, { scrollTo: { y: this.pageHeight * this.$currentSlide.dataset.index } });
    }
  }

  /**
   * Handle mouse wheel event for navigation.
   * @param {WheelEvent} event - The wheel event object.
   */
  onMouseWheel(event) {
    if (this.isAnimating) {
      event.preventDefault();  // Prevent default behavior and avoid re-triggering
      return;
    }
    const delta = event.wheelDelta / 30 || -event.detail;
    if (delta < -1) {
      this.goToNextSlide();
    } else if (delta > 1) {
      this.goToPrevSlide();
    }
    event.preventDefault();
  }

  /**
   * Handle keydown event for navigation.
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  onKeyDown(event) {
    const PRESSED_KEY = event.keyCode;
    if (PRESSED_KEY === this.keyCodes.UP) {
      this.goToPrevSlide();
      event.preventDefault();
    } else if (PRESSED_KEY === this.keyCodes.DOWN) {
      this.goToNextSlide();
      event.preventDefault();
    }
  }


  initAutoScrollToggle() {
    if (this.$toggleCheckbox) {
      this.$toggleCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.startAutoScroll();
        } else {
          this.stopAutoScroll();
        }
      });
    }
  }

  startAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }

    const scrollTime = this.getAutoScrollTime();
    this.startProgressBarAnimation(scrollTime);

    this.autoScrollInterval = setInterval(() => {
      if (this.navigationEnabled && !this.isAnimating) {
        this.goToNextSlide();
      }
    }, scrollTime);
  }

  stopAutoScroll(isManualToggle = false) {
    // Clear the auto-scroll interval if active
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }

    // Kill the progress bar animation if active
    if (this.progressBarAnimation) {
      this.progressBarAnimation.kill();
      this.progressBarAnimation = null;
    }

    // Reset the progress bar width
    if (this.$progressBar) {
      gsap.set(this.$progressBar, { width: '0%' });
    }

    // Only uncheck the checkbox if it's the last slide or if it was manually toggled
    const isLastSlide = this.$currentSlide && !this.$currentSlide.nextElementSibling;
    if (this.$toggleCheckbox && (isLastSlide || isManualToggle)) {
      this.$toggleCheckbox.checked = false;
    }
  }


  startProgressBarAnimation(duration) {
    if (this.$progressBar) {
      if (this.progressBarAnimation) {
        this.progressBarAnimation.kill();
      }
      gsap.set(this.$progressBar, { width: '0%' });
      this.progressBarAnimation = gsap.to(this.$progressBar, {
        width: '100%',
        duration: duration / 1000, // Convert ms to seconds for GSAP
        ease: 'linear',
      });
    }
  }

  getAutoScrollTime() {
    const currentSlide = this.$currentSlide;
    return parseInt(currentSlide.dataset.autoScrollTime) || this.options.defaultAutoScrollTime;
  }
  /**
   * Navigate to the previous slide.
   */
  goToPrevSlide() {
    if (!this.navigationEnabled) {
      console.log('Navigation is disabled. Ignoring slide change.');
      return; // Block the function until navigation is enabled
    }
    const prevSlide = this.$currentSlide.previousElementSibling;
    if (prevSlide) this.goToSlide(prevSlide, 'up');
  }

  goToNextSlide() {
    if (!this.navigationEnabled) {
      console.log('Navigation is disabled. Ignoring slide change.');
      return; // Block the function until navigation is enabled
    }
    const nextSlide = this.$currentSlide.nextElementSibling;

    if (nextSlide) {
      this.goToSlide(nextSlide, 'down');
    } else {
      // If we've reached the last slide, uncheck the checkbox
      if (this.$toggleCheckbox) {
        this.$toggleCheckbox.checked = false;  // Uncheck at the last slide
      }
      this.stopAutoScroll();  // Stop auto-scrolling
    }

    // If auto-scroll is still active, restart it
    if (this.autoScrollInterval) {
      this.stopAutoScroll();
      this.startAutoScroll();
    }
  }
  /**
     * Handle navigation button click.
     * @param {Event} event - The click event object.
     */
  onNavButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    console.log('Nav button clicked');
    const $button = event.currentTarget;
    const targetIndex = this.$navButtons.indexOf($button);
    const $targetSlide = this.$slides[targetIndex];

    console.log('Current slide:', this.$currentSlide.id);
    console.log('Target slide:', $targetSlide ? $targetSlide.id : 'undefined');
    console.log('Current Index:', this.$slides.indexOf(this.$currentSlide));
    console.log('Target Index:', targetIndex);

    if ($targetSlide && $targetSlide !== this.$currentSlide) {
      const currentIndex = this.$slides.indexOf(this.$currentSlide);

      // Use 'up' only if navigating to a previous slide
      const direction = (targetIndex < currentIndex) ? 'up' : 'down';

      console.log('Direction:', direction);

      this.goToSlide($targetSlide, direction);
    } else {
      console.log('Invalid target slide or already on this slide');
      console.log('$targetSlide exists:', !!$targetSlide);
      console.log('$targetSlide !== this.$currentSlide:', $targetSlide !== this.$currentSlide);
    }
  }
  /**
   * Navigate to a specific slide.
   * @param {HTMLElement} $slide - The target slide element.
   * @param {string} direction - The direction of navigation ('up' or 'down').
   */
  goToSlide($slide, direction, isInitialNavigation = false) {
    console.log('Slide:', $slide ? $slide.id : 'undefined');
    console.log('Direction:', direction);
    console.log('Is animating:', this.isAnimating);
    console.log('Current slide:', this.$currentSlide.id);

    // Check if the target slide is the same as the current slide
    if ($slide === this.$currentSlide) {
      console.log('Already on the target slide, skipping.');
      return;  // Don't re-trigger the slide change if it's the same slide
    }

    if (!this.isAnimating && $slide && $slide !== this.$currentSlide) {
      console.log('Changing to slide:', $slide.id, 'Direction:', direction, 'Initial Navigation:', isInitialNavigation);
      this.isAnimating = true;

      // Dispatch slideChangeStart event
      this.slideChangeStartEvent.detail.slideIndex = $slide.dataset.index;
      this.slideChangeStartEvent.detail.direction = direction;
      document.dispatchEvent(this.slideChangeStartEvent);

      // If it's the initial navigation, skip the fade animation
      if (isInitialNavigation) {
        this.changeSlide($slide, direction, isInitialNavigation);  // Pass the parameter
      } else if (direction === 'down' && $slide.hasAttribute('data-video-fade')) {
        gsap.to(this.video, {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            this.changeSlide($slide, direction, isInitialNavigation);  // Pass the parameter
          }
        });
      } else {
        this.changeSlide($slide, direction, isInitialNavigation);  // Pass the parameter
      }
    } else {
      console.log('Not changing slide.');
      console.log('- Is animating:', this.isAnimating);
      console.log('- Valid slide:', !!$slide);
      console.log('- Different from current:', $slide !== this.$currentSlide);
    }

    // Add class to #scroll-wrap based on the slide change count
    const scrollWrap = document.getElementById('scroll-wrap');

    if (scrollWrap) {
      // Initialize a counter if it doesn't exist
      if (!this.slideChangeCount) {
        this.slideChangeCount = 0;
      }

      // Only proceed if less than 4 changes
      if (this.slideChangeCount < 4) {
        this.slideChangeCount++; // Increment on each slide change

        // Add the corresponding class based on the count
        if (this.slideChangeCount === 1) {
          scrollWrap.classList.add('one');
        } else if (this.slideChangeCount === 2) {
          scrollWrap.classList.add('two');
          scrollWrap.classList.remove('one');
        } else if (this.slideChangeCount === 3) {
          scrollWrap.classList.add('three');
          scrollWrap.classList.remove('two');
        } else if (this.slideChangeCount === 4) {
          scrollWrap.classList.add('done');
          scrollWrap.classList.remove('three');
        }
      }
    }

    if (this.autoScrollInterval) {
      this.stopAutoScroll();
      this.startAutoScroll();
    }
  }


  /**
   * Change the current slide.
   * @param {HTMLElement} $slide - The target slide element.
   * @param {string} direction - The direction of navigation ('up' or 'down').
   */
  changeSlide($slide, direction, isInitialNavigation = false) {
    if (!isInitialNavigation) {
      this.animateSlide(this.$currentSlide, direction, 'exit');
    }

    if (this.options.enableNavAnimation) {
      this.centerActiveLink();
    }
    if (this.slideAnimations[this.$currentSlide.id]) {
      this.slideAnimations[this.$currentSlide.id].pause();
    }

    // Remove the active class from the current slide and add it to the new slide
    this.$currentSlide.classList.remove("active");
    $slide.classList.add("active");
    this.$currentSlide = $slide;

    if (!isInitialNavigation) {
      this.animateSlide(this.$currentSlide, direction, 'enter');
    }

    gsap.to(this.$window, {
      scrollTo: { y: this.pageHeight * this.$currentSlide.dataset.index },
      duration: isInitialNavigation ? 0 : 1,
      onComplete: this.onSlideChangeEnd.bind(this)
    });

    if (this.slideAnimations[$slide.id]) {
      this.slideAnimations[$slide.id].play();
    }

    this.$navButtons.forEach(btn => btn.classList.remove("active"));
    const activeButton = this.$navButtons[parseInt($slide.dataset.index)];
    if (activeButton) activeButton.classList.add("active");

    this.syncVideoToSlide(this.$currentSlide, direction);

    // Trigger GSAP animation for the active section
    triggerGSAPAnimationForActiveSection();

    // Update the header based on the new active slide
    const headerValue = $slide.getAttribute('data-header');
    const footerValue = $slide.getAttribute('data-footer');
    if (this.$header || this.$footer) {
      if (headerValue) {
        this.$header.setAttribute('data-header', headerValue);
        this.$footer.setAttribute('data-footer', footerValue);
      } else {
        this.$header.removeAttribute('data-header');
        this.$footer.removeAttribute('data-footer');
      }
    }

    // Update the URL in the address bar to the current slide's ID
    const slideId = $slide.id;
    if (slideId) {
      history.pushState(null, null, `#${slideId}`);
    }
  }

  /**
   * Animate a slide (enter or exit).
   * @param {HTMLElement} $slide - The slide to animate.
   * @param {string} direction - The direction of animation ('up' or 'down').
   * @param {string} action - The type of animation ('enter' or 'exit').
   */
  animateSlide($slide, direction, action) {
    const $content = $slide.querySelector('.slide-content');
    const timeline = gsap.timeline();

    if (action === 'exit' && this.$currentSlide.hasAttribute('data-video-fade') && direction !== 'down') {
      if (this.video) {
        timeline.to(this.video, { opacity: 1, duration: 1 }, 0);
      }
    }

    if (action === 'enter') {
      gsap.set($slide, { opacity: 1 });
      if (direction === 'down') {
        timeline
          .fromTo($slide, { y: '0%' }, { y: 0, duration: 1 })
          .fromTo($content, { y: 0, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.2');
      } else {
        timeline
          .fromTo($slide, { y: '0%' }, { y: 0, duration: 1 })
          .fromTo($content, { y: -0, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.2');
      }
    } else if (action === 'exit') {
      if (direction === 'down') {
        timeline
          .to($content, { y: -0, opacity: 0, duration: 1 })
          .to($slide, { y: '0%', duration: 1 }, '-=0.2');
      } else {
        timeline
          .to($content, { y: 0, opacity: 0, duration: 1 })
          .to($slide, { y: '0%', duration: 1 }, '-=0.2');
      }
    }
  }

  /**
   * Synchronize video playback with the current slide.
   * @param {HTMLElement} $slide - The current slide element.
   * @param {string} direction - The direction of navigation ('up' or 'down').
   */
  /**
   * Synchronize video playback with the current slide.
   * @param {HTMLElement} $slide - The current slide element.
   * @param {string} direction - The direction of navigation ('up' or 'down').
   */
  syncVideoToSlide($slide, direction) {
    const index = parseInt($slide.dataset.index);
    let startTime, endTime, loopStart, loopEnd;

    if (!this.positions[index]) {
      // console.error(`No position data for slide index ${index}`);
      return;
    }

    if (direction === 'down') {
      startTime = this.positions[index].forward[0];
      endTime = this.positions[index].forward[1];
    } else {
      const currentSlideIndex = index + 1;
      if (this.positions[currentSlideIndex] && this.positions[currentSlideIndex].back) {
        startTime = this.positions[currentSlideIndex].back[0];
        endTime = this.positions[currentSlideIndex].back[1];
      } else {
        startTime = this.positions[index].now[0];
        endTime = this.positions[index].now[1];
      }
    }

    loopStart = this.positions[index].now[0];
    loopEnd = this.positions[index].now[1];

    // console.log(`Syncing Video to Slide ${index}: Start Time: ${startTime}, End Time: ${endTime}, Loop Start: ${loopStart}, Loop End: ${loopEnd}`);

    // Remove previous event listeners
    this.video.removeEventListener('timeupdate', this.loopVideoHandler);
    this.video.removeEventListener('timeupdate', this.transitionVideoHandler);

    // Get the data-loop-count attribute value instead of data-loop
    const loopCount = parseInt($slide.dataset.loopCount) || Infinity;

    this.transitionVideoHandler = () => {
      if (this.video.currentTime >= endTime) {
        this.video.removeEventListener('timeupdate', this.transitionVideoHandler);
        // console.log(`Transition End reached at ${endTime}. Starting loop from ${loopStart} to ${loopEnd}`);
        this.video.currentTime = Math.max(loopStart, .01);
        this.loopCounter = 0;
        this.loopVideoHandler = this.loopVideoWithLimit.bind(this, loopStart, loopEnd, loopCount);
        this.video.addEventListener('timeupdate', this.loopVideoHandler);
      }
    };

    // Reset video playback
    this.video.currentTime = Math.max(startTime, .01);
    this.video.play().then(() => {
      this.video.addEventListener('timeupdate', this.transitionVideoHandler);
    }).catch(err => console.error('Error playing video:', err));
  }


  loopVideoWithLimit(loopStart, loopEnd, maxLoops) {
    if (!this.loopCounter) {
      this.loopCounter = 0;
    }

    if (this.video.currentTime >= loopEnd - 0.2) {
      this.loopCounter++;
      console.log(`Loop ${this.loopCounter} of ${maxLoops} completed`);

      if (this.loopCounter < maxLoops) {
        // console.log(`Restarting loop from ${loopStart}`);
        setTimeout(() => {
          this.video.currentTime = Math.max(loopStart, .01);
          this.video.play(); // Ensure video plays after setting time
        }, 100); // Adding a 100ms delay before resetting loop
      } else {
        // console.log(`Maximum loops (${maxLoops}) reached. Ending at ${loopEnd}`);
        this.video.removeEventListener('timeupdate', this.loopVideoHandler);
        this.loopCounter = 0; // Reset the counter for future use

        if (this.video.currentTime !== loopEnd) {
          this.video.currentTime = loopEnd;
        }

        // Dispatch a custom event to signal that looping has finished
        const event = new CustomEvent('loopingFinished', { detail: { slideIndex: this.$currentSlide.dataset.index } });
        this.$currentSlide.dispatchEvent(event);
      }
    }
  }

  // Add this new method to ensure video stays within bounds
  enforceVideoBounds(start, end) {
    if (this.video.currentTime < start) {
      this.video.currentTime = start;
    } else if (this.video.currentTime > end) {
      this.video.currentTime = end;
      this.video.pause();
    }
  }

  loopVideoWithLimit(loopStart, loopEnd, maxLoops) {
    if (!this.loopCounter) {
      this.loopCounter = 0;
    }

    // Check if the loop end has been reached
    if (this.video.currentTime >= loopEnd) {
      this.loopCounter++;
      // console.log(`Loop ${this.loopCounter} of ${maxLoops} completed`);

      if (this.loopCounter < maxLoops) {
        // console.log(`Restarting loop from ${loopStart}`);
        // Adjust this time reset logic to ensure it's not triggering too quickly
        this.video.currentTime = Math.max(loopStart, .01);
      } else {
        // console.log(`Maximum loops (${maxLoops}) reached. Ending at ${loopEnd}`);
        this.video.removeEventListener('timeupdate', this.loopVideoHandler);
        this.loopCounter = 0; // Reset loop counter for the next slide

        // Ensure video ends at the correct position and pauses
        this.video.currentTime = loopEnd;
        this.video.pause();  // Pause the video once maximum loops are reached

        // Dispatch a custom event to indicate looping has finished
        const event = new CustomEvent('loopingFinished', { detail: { slideIndex: this.$currentSlide.dataset.index } });
        this.$currentSlide.dispatchEvent(event);
      }
    }
  }


  /**
   * Handle the end of a slide change animation.
   */
  onSlideChangeEnd() {
    this.isAnimating = false; // Allow future transitions
    console.log("Slide transition completed, isAnimating set to false."); // Reattach modal button listeners
    this.addTouchListeners();   // Reattach swipe/touch events
    if (!this.$currentSlide.hasAttribute('data-video-fade') && this.video) {
      gsap.to(this.video, { opacity: 1, duration: 1 });
    }

    // Fix for IOS 17 button problems
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      const html = document.documentElement;
      html.style.transform = 'rotate(0.1deg)';  // Minimal layout change for touch devices
      setTimeout(() => {
        html.style.transform = 'rotate(0)';
      }, 50);  // Revert it back
    }

    // Dispatch slideChangeEnd event
    this.slideChangeEndEvent.detail.slideIndex = this.$currentSlide.dataset.index;
    document.dispatchEvent(this.slideChangeEndEvent);
  }

  /**
   * Disable scroll events.
   */
  disableScrollEvents() {
    console.log('Disabling scroll events.');
    this.$window.addEventListener("wheel", this.preventScroll, { passive: false });
    this.$document.addEventListener("keydown", this.preventScroll, { passive: false });
  }

  /**
   * Enable scroll events.
   */
  enableScrollEvents() {
    console.log('Enabling scroll events.');
    this.$window.removeEventListener("wheel", this.preventScroll, { passive: false });
    this.$document.removeEventListener("keydown", this.preventScroll, { passive: false });
  }

  /**
   * Prevent default scroll behavior.
   * @param {Event} event - The event to prevent.
   */
  preventScroll(event) {
    event.preventDefault();
  }

  /**
   * Center the active navigation link.
   * @param {boolean} initial - Whether this is the initial centering.
   */
  centerActiveLink(initial = false) {
    const navContainer = document.querySelector('.presentation-navigation');
    const activeLink = navContainer.querySelector('.active');

    if (!navContainer || !activeLink) return;

    const navHeight = navContainer.clientHeight;
    const activeLinkHeight = activeLink.clientHeight;
    const navTop = navContainer.getBoundingClientRect().top;
    const navCenter = navTop + navHeight / 2;
    const activeLinkTop = activeLink.getBoundingClientRect().top;
    const offset = activeLinkTop - (navCenter - activeLinkHeight / 2 - 50);

    if (this.options.enableNavAnimation) {
      if (initial) {
        gsap.set(navContainer, { y: -offset });
      } else {
        gsap.to(navContainer, { y: -offset, duration: 0.25, ease: "power1.inOut" });
      }
    }
  }

  /**
   * Update the loader progress.
   */
  updateLoaderProgress() {
    if (!this.$loadingOverlay) {
      console.error('Loading overlay not found');
      return;
    }

    this.$loadingOverlay.innerHTML = '';
    this.$loadingOverlay.style.display = 'flex';
    this.$loadingOverlay.style.opacity = '1';  // Ensure the overlay is fully visible

    if (this.options.useLottieLoader) {
      this.playLottieLoader();
    } else {
      this.playCounterLoader();
    }
  }

  /**
  * Play the Lottie loader animation.
  */
  playLottieLoader() {
    if (!this.options.lottieLoaderPath) {
      console.error('Lottie loader path not provided. Falling back to counter loader.');
      this.playCounterLoader();
      return;
    }

    const lottieContainer = document.createElement('div');
    lottieContainer.className = 'lottie-loader-container';
    this.$loadingOverlay.appendChild(lottieContainer);

    this.loaderAnimation = lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: false,  // Ensure it plays only once
      autoplay: true,
      path: this.options.lottieLoaderPath
    });

    this.loaderAnimation.addEventListener('complete', () => {
      // console.log('Lottie animation complete');  // Log when the animation completes
      this.hideLoader();  // Call hideLoader, which includes fadeOutLoader
    });
  }

  /**
   * Play the counter loader animation.
   */
  playCounterLoader() {
    const loadingWrapper = document.createElement('div');
    loadingWrapper.className = 'loading-wrapper';
    this.$loadingOverlay.appendChild(loadingWrapper);

    // Create the additional elements with the "base" class and append them to the .loading-wrapper
    const one = document.createElement('div');
    one.className = 'base one';
    loadingWrapper.appendChild(one);

    const two = document.createElement('div');
    two.className = 'base two';
    loadingWrapper.appendChild(two);


    const loaderText = document.createElement('div');
    loaderText.className = 'loading-text';
    loadingWrapper.appendChild(loaderText);

    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 100) {
        progress += 1;
        loaderText.textContent = `${progress}%`;
        // console.log('Counter loader progress:', progress); // Debug log for tracking progress
      } else {
        clearInterval(interval);
        console.log('Counter loader complete');  // Log when the counter reaches 100%
        if (!this.loaderCompleted) { // Check flag before calling fadeOutLoader
          this.loaderCompleted = true; // Set the flag
          this.fadeOutLoader(); // Call fadeOutLoader once counter reaches 100
        }
      }
    }, 30);  // Adjust the timing if necessary
  }

  /**
   * Fade out the loader overlay.
   */
  fadeOutLoader() {
    if (this.isFadingOut || !this.loaderCompleted) return; // Prevent multiple calls
    this.isFadingOut = true; // Set the flag to prevent further calls

    console.log('Fading out loader');
    const fadeOutDuration = 1; // Duration of fade-out animation in seconds

    gsap.to(this.$loadingOverlay, {
      opacity: 0,
      duration: fadeOutDuration,
      pointerEvents: "none",
      onComplete: () => {
        this.hideLoader(); // Call hideLoader after fade-out
        this.isFadingOut = false; // Reset the flag once the animation completes

        if (!this.eventDispatched) { // Ensure the event is dispatched once
          this.dispatchLoaderEvent(); // Dispatch the custom event
          this.eventDispatched = true; // Set the flag to prevent further dispatch
        }
      }
    });
  }




  hideLoader() {
    if (this.$loadingOverlay) {
      gsap.to(this.$loadingOverlay, {
        opacity: 0,
        duration: 2, // Duration of fade-out animation in seconds
        pointerEvents: "none",
        onComplete: () => {
          // Ensure that fadeOutLoader doesn't get called again here
          if (!this.isFadingOut && !this.eventDispatched) {
            this.dispatchLoaderEvent();
          }
        }
      });
      // Clean up loader animation if any
      if (this.loaderAnimation) {
        // this.loaderAnimation.destroy();
        this.loaderAnimation = null;
      }
    }
  }

  // Custom event dispatch function
  dispatchLoaderEvent() {
    const loaderEvent = new CustomEvent('loaderFadedOut', {
      detail: { message: 'Loader has faded out', timestamp: new Date() }
    });
    document.dispatchEvent(loaderEvent);  // Dispatch the custom event
  }

  // Add this method back
  playInitialTransition() {
    const pos = this.positions[0].forward;
    const startTime = pos[0];
    const endTime = pos[1];
    const loopStart = this.positions[0].now[0];
    const loopEnd = this.positions[0].now[1];

    console.log('Playing initial transition:', {
      startTime,
      endTime,
      loopStart,
      loopEnd
    });

    this.video.currentTime = Math.max(startTime, .01);
    
    const onTimeUpdate = () => {
      if (this.video.currentTime >= endTime) {
        this.video.removeEventListener('timeupdate', onTimeUpdate);
        console.log(`Transition End reached at ${endTime}. Starting loop`);
        // Set up the loop
        this.video.currentTime = Math.max(loopStart, .01);
        this.loopVideoHandler = this.loopVideo.bind(this, loopStart, loopEnd);
        this.video.addEventListener('timeupdate', this.loopVideoHandler);
      }
    };

    this.video.addEventListener('timeupdate', onTimeUpdate);
  }

}

// Function to trigger GSAP animation based on `data-gsap-animation`
// Global object to track running GSAP animations
const runningAnimations = {};

// Function to trigger GSAP animation based on `data-gsap-animation`
function triggerGSAPAnimationForActiveSection() {
  const activeSection = document.querySelector('.slide.active');

  if (activeSection) {
    const animationName = activeSection?.getAttribute('data-gsap-animation');

    if (animationName) {
      if (runningAnimations[activeSection.id]) {
        runningAnimations[activeSection.id].kill();
        delete runningAnimations[activeSection.id];
        console.log(`Killed previous animation for ${activeSection.id}`);
      }
  
      if (animationName && typeof window[animationName] === 'function') {
        // Delay the animation start if it's the initial hash navigation
        const delay = window.initialHashNavigation ? 0.5 : 0;
        setTimeout(() => {
          runningAnimations[activeSection.id] = window[animationName](activeSection);
        }, delay * 1000);
      } else {
        console.warn(`No valid animation found for ${animationName}`);
      }
    }

    
  } else {
    console.warn("No active section found.");
  }
}