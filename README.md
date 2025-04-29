## Devpost Link
https://devpost.com/software/vivasign

## Video Demo
[![Watch the video](https://img.youtube.com/vi/pD90VZ25B0M/maxresdefault.jpg)](https://www.youtube.com/watch?v=pD90VZ25B0M)

## Team Info

**Team Name:** Gesture Gurus

**Team Members:** Owen Chen, Axel O’Brien, Jaime Graft, Joao De Arujo Junior

## Problem Statement & Inspiration
Existing sign language learning apps fall short because they lack a critical element: feedback. While many provide instructions and examples, they rarely evaluate a user's actual signing attempts. Some don’t even encourage physical practice, leading users to simply memorize signs rather than building the muscle memory essential for real fluency.

Without feedback, crucial errors in hand shape, movement, orientation, location, and facial expression go unchecked. Learners are left guessing, often reinforcing bad habits instead of improving. This challenge is especially severe where in-person instruction or access to fluent signers is limited, restricting learning opportunities for countless people around the world.

Generic, one-size-fits-all content simply doesn’t work for mastering a complex, visual language like sign language. To build confidence and true fluency, learners need to know if they’re signing correctly—but current tools fail to provide that.

Our project directly addresses this gap by creating a system that offers the specific, actionable feedback learners need to truly improve and succeed in their learning journey.

## Project Description (What it does)
We give users the ability to practice their signs. We generate feedback that details what they’re doing well and how they can improve by sending screenshots of their gestures to Google Gemini for analysis.

## Software Details (How we built it)
Frontend: Our user interface is built with React.js, providing an interactive experience where users capture and submit a sequence of keyframe images representing their attempt at a specific sign.

Backend: A Python Flask API (hosted on Render) is responsible for receiving the user’s images from the frontend, querying our PostgreSQL database (hosted on Aiven) for detailed reference data on the corresponding sign (including descriptions of the correct hand shape, location, palm orientation, and facial expression for each keyframe), and communicating with Gemini.

AI Integration: The data received by the backend is sent to Gemini for analysis. We leverage its powerful multimodal capabilities to perform a comprehensive evaluation of the user’s attempt at signing, comparing the user's keyframe images against the information in our database. Gemini then generates personalized feedback based on this comparison for each frame. This feedback is relayed to the user through the frontend

## Challenges we ran into
Finding a method of evaluating gestures and generating feedback to the user was difficult. Special purpose models often were unable to provide detailed feedback, whereas LLMs weren't able to provide consistent, reliable evaluation.

We found Google Gemini to be the best (but still imperfect) available solution for this sort of task. We managed to mitigate the issues that came up with Gemini by experimenting with specific instructions (such as finding the right balance between critical and constructive for our feedback) and feeding it different kinds of data (it worked best when evaluating images against textual descriptions provided by a reliable source—an actual ASL signer from our team, Sky De Araujo; this grounded its responses and greatly reduced hallucinations).

We ran into some issues in the front end when setting up the live feed from the user's webcam, displaying countdowns with an overlay for accessibility and clarity, and making requests to the API, but we ended up resolving these issues eventually.

## Accomplishments that we're proud of
We’ve built a pleasant looking website that serves as a helpful tool for practicing ASL. With access to more data, and time for proper validation testing, we can expand the usefulness of our application in a straightforward manner.

## What we learned
We learned a lot about webcam integration, react state changes and interactivity. We developed our styling skills, and our ability to work in parallel on different tasks without inciting breaking merge conflicts. We learned how to develop an API that can query databases, send requests to Gemini, and handle cross-origin resource requests.

## What's next for VivaSign
We're working on expanding our database of signs (sourced from human signers for maximal data reliability), and to extend our demo into a real learning platform, with user authentication, progress tracking, and a gamified system that incentivizes learning. We’re also trying to make it possible to practice several popular sign languages from around the world, not just ASL, as well supporting translation into languages besides English. For now, we rely on existing browser translation solutions (e.g. Google Translate's Chrome extension) to provide accessibility across languages.
