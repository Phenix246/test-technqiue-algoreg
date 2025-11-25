## Face recognition frontend

### Synopsis

In the context of a video onboarding solution, you must create a face recognition step. It is a single page view that must guide the end user to proceed in a liveness check (moving its head to get different angles).

### Subject

1. The development must be in **typescript** using **React**, **VueJS** or similar frameworks.
2. You will provide a README.md containing description of how to run your project.
3. You will note the time used for this project but there is no strict time limit.
4. Finally the code will be accessible from your Github with the license you prefer (MIT, AGPL, etc).

Your focus will be:
- Creating a beautiful and clear UI showing the live video of the end user
- Add a feedback about the current face orientation
- Indicate to the user the action to perform
- Take pictures of several angles that will be usable for the liveness check

You do **not** have to (or take it as a bonus):
- Create confirmation page or introduction page, taken photos can either be downloaded from frontend, or logged as base64 in the console
- Implement camera access checks, the end user will give the browser access to the camera and reload the browser if needed until it works
- Choose the right camera automatically (eg selecting the face orientation camera)

### Resources
- Choose your library between JeelizFaceFilter (https://github.com/jeeliz/jeelizFaceFilter) and Mediapipe (https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js).
**Note: it seems jeelizFaceFilter can lead to some issues in strict_mode, i recommend using mediapipe**
- Example of interaction leading to good liveness check https://dribbble.com/shots/7841923-Facial-Recognition-Registration-for-Events or https://dribbble.com/shots/15901276-Face-Verification-Interaction-for-E-Wallet or https://dribbble.com/shots/15801801-Face-Recognize-Tool-Interaction

### What is expected

We want to test your ability implement together complex frontend features (canvas, video, maybe webGL or SVG animations) that can have a huge performance impact if wrongly used.
We will focus on the end user feeling and easiness to use your implementation.
A good UI is important, your ability to create your own or to pixel-perfect-copy one of the examples in resources (or one you find yourself and you like particularly) will be a huge advantage.

### Notes about user interaction

As you can see in the examples we can do it a different ways:
- Ask the user to do this, then that etc until we get each photos
- Ask the user to move the head around and only show a percentage that goes to 100% when we get enough different angles
- ...

The only goal is to get the quickest possible 3 pictures (or more) of very different poses to ensure the liveness of the user.