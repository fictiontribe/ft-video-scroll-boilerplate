# VideoSnapScroll Boilerplate

![Screenshot](https://images.fictiontribe.com/simstim-og.jpg)

### [Check out the demo](https://fictiontribe.com/simstim/) <br/> <br/>

## Installation
Clone the boilerplate:
```
git clone https://github.com/fictiontribe/ft-video-scroll-js.git
```
and use NPM to install dependencies:

```
npm install
```

## Demo Project
Inside this repository, you'll find a complete demo project in the `SimStim-demo` folder. This demo provides an example of a full landing page built using this boilerplate.

To run the demo:
```bash
cd SimStim-demo
npm install
npm run start
```

The demo project follows the same build and development commands as the main project:
- `npm run start` - Start development server
- `npm run build` - Create production build

Note: Make sure to run `npm install` within the SimStim-demo folder as it has its own dependencies.

## Usage

Start a development server:

```
npm run start
```

Create a production build:

```
npm run build
```


# VideoSnapScroll

`VideoSnapScroll` is a JavaScript class that manages a full-page scrolling presentation with synchronized video playback. This class leverages the GreenSock Animation Platform (GSAP) libraries for smooth animations and transitions between sections. Additionally, it supports optional loading animations using Lottie or a simple counter.

By integrating GSAP, VideoSnapScroll ensures seamless and visually appealing transitions.

By using Lottie, you can include complex animations as part of the loading experience.

## Features

- Full-page scrolling presentation
- Synchronized video playback with defined loop and transition points
- Optional loading animations (Lottie or counter)
- Customizable navigation buttons
- Section fade-in effects
- Mobile and desktop video sources
- Adjustable slide auto-scroll times with data-auto-scroll-time
- Video loop control per slide with data-loop-count
- Dynamic header and footer styling with data-header / data-footer
- Custom GSAP animations per slide with data-gsap-animation

## Installation

### Option 1: Using HTML Script Tags

Include the required libraries in your HTML file:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/ScrollToPlugin.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.6/lottie.min.js"></script>
```

### Option 2: Using NPM

Install the required libraries using NPM:

```javascript
npm install gsap lottie-web
```

```javascript
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import lottie from "lottie-web";
import VideoSnapScroll from "path/to/VideoSnapScroll";

// Register the GSAP plugin
gsap.registerPlugin(ScrollToPlugin);
```


## Include the VideoSnapScroll script in your HTML file:
```
<script src="path/to/VideoSnapScroll.js"></script>
```

##  Usage
Initialize the VideoSnapScroll class with the desired options. The following example demonstrates how to set it up:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const vidSnapScroll = new VideoSnapScroll({
    srcDesktop: 'https://example.com/desktop-video.mp4',
    srcMobile: 'https://example.com/mobile-video.mp4',
    breakpoint: 991,
    sectionContainer: 'section',
    container: 'body',
    scrollContainer: 'body',
    videoContainer: '#backgroundVideo',
    enableSectionFadeIn: true,
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
    lottieLoaderPath: 'path/to/lottie-loader.json',
  });

  vidSnapScroll.updateLoaderProgress();
});
```

## Data Attributes
To control the behavior of each section and its interaction with the video, you can use the following data attributes:

### Video Timing Attributes

- `data-loop-start` (string): The start time for the video loop in the format HH:MM:SS.
- `data-loop-end` (string): The end time for the video loop in the format HH:MM:SS.
- `data-transition-start` (string): The start time for the forward transition in the format HH:MM:SS.
- `data-transition-end` (string): The end time for the forward transition in the format HH:MM:SS.
- `data-transition-start-backward` (string): The start time for the backward transition in the format HH:MM:SS.
- `data-transition-end-backward` (string): The end time for the backward transition in the format HH:MM:SS.

### Example usage:

```html
<section 
  data-loop-start="00:49:02" 
  data-loop-end="00:52:10"
  data-transition-start="00:42:39" 
  data-transition-end="00:46:05" 
  data-transition-start-backward="00:46:07"
  data-transition-end-backward="00:48:29">
</section>
```

### Other Data Attributes

- `data-video-fade` (boolean): If present, it triggers a fade effect for the video. Good for slides that dont have Video Timing Attributes.
- `data-lottie-path` (string): Path to the Lottie animation JSON file.
- `data-lottie-loop` (boolean): If true, the Lottie animation will loop.
- `data-nav-title` (string): Title for the navigation button.
- `data-lottie-container` (string): Selector for the Lottie animation container.
- `data-auto-scroll-time` (number): Controls how long the slide will stay on screen before changing (in milliseconds).
- `data-loop-count` (number): Controls how many times the slide's video will loop before stopping.
- `data-header` (string): Controls dynamic header and footer styles by changing the data-header attribute on both the header and the footer.
- `data-gsap-animation` (string): Defines a custom GSAP animation for each slide.

### Example usage:

```html
<section 
  id="slide-9" 
  class="slide"
  data-loop-start="01:22:05"
  data-loop-end="01:22:14"
  data-transition-start="01:19:06"
  data-transition-end="01:20:03"
  data-transition-start-backward="01:20:16"
  data-transition-end-backward="01:21:13"
  data-auto-scroll-time="6000"
  data-loop-count="2"
  data-header="dark"
  data-video-fade 
  data-lottie-path="lottie/loader.json" 
  data-lottie-loop="true" 
  data-nav-title="No Video"
  data-gsap-animation="slide1">
  <div class="lottie-animation-container"></div>
</section>
```

## Custom GSAP Animations
With the data-gsap-animation attribute, you can define custom animations for each slide using GSAP. Here’s an example of how to create a custom animation for a specific slide:
```js
window.slide1 = function ($slide) {
    const timeline = gsap.timeline({ delay: 0.5 });

    timeline.fromTo("#slide-1 .lower-text",
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1 }); // Animate first text

    return timeline; // Return the timeline so it can be tracked
};
```

### Options

- `srcDesktop` (string): URL for the desktop video source.
- `srcMobile` (string): URL for the mobile video source.
- `breakpoint` (number): Screen width threshold to switch between mobile and desktop video sources.
- `sectionContainer` (string): Selector for the sections of the presentation.
- `container` (string): Selector for the main container.
- `scrollContainer` (string): Selector for the scrollable container.
- `videoContainer` (string): Selector for the video element.
- `enableSectionFadeIn` (boolean): Enable fade-in effect for sections.
- `forceSkipFade` (boolean): Force skip fade animations.
- `frameGap` (number): Frame gap for video synchronization.
- `easing` (string): Easing function for animations.
- `navContainer` (boolean): Enable navigation container.
- `prevButton` (string): Selector for the previous button.
- `nextButton` (string): Selector for the next button.
- `enableNavAnimation` (boolean): Enable navigation animation.
- `loadingOverlay` (string): Selector for the loading overlay.
- `loadingText` (string): Selector for the loading text element.
- `useLottieLoader` (boolean): Use Lottie animation for the loader.
- `lottieLoaderPath` (string): Path to the Lottie loader animation JSON file.


### Methods

#### `init()`
Initializes the `VideoSnapScroll` instance, sets up positions, creates the navigation container, and loads the video.

#### `updateLoaderProgress()`
Updates the loader progress. If `useLottieLoader` is `true`, it plays the Lottie animation; otherwise, it plays the counter loader.

#### `playLottieLoader()`
Plays the Lottie loader animation. Ensures the animation completes at least once before fading out.

#### `playCounterLoader()`
Plays the counter loader animation. Ensures the counter reaches 100% before fading out.

#### `fadeOutLoader()`
Fades out the loader overlay.

#### `hideLoader()`
Hides the loader overlay.