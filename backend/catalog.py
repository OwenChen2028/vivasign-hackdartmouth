from pathlib import Path


SIGN_EXAMPLES_DIRECTORY = Path(__file__).parent / "sign_examples"

SIGN_DATA = {
    "Hello": [
        {
            "handshape": "Keep a flat hand with your fingers together and your thumb alongside your index finger.",
            "location": "Start near the side of your forehead or temple.",
            "orientation": "Face your palm mostly forward, angled slightly outward.",
            "nms": "Use a neutral, friendly expression or a slight smile.",
        },
        {
            "handshape": "Maintain the same flat handshape.",
            "location": "Move slightly outward and forward from your head.",
            "orientation": "Keep your palm mostly forward.",
            "nms": "Keep a neutral, friendly expression or a slight smile.",
        },
    ],
    "Meet": [
        {
            "handshape": "Make a fist with each hand and point both index fingers upward.",
            "location": "Hold your hands apart in front of your chest.",
            "orientation": "Face your palms toward each other.",
            "nms": "Use a neutral expression.",
        },
        {
            "handshape": "Keep both index fingers pointing upward.",
            "location": "Bring your hands together in front of your chest until their sides touch.",
            "orientation": "Keep your palms facing each other.",
            "nms": "Use a neutral expression.",
        },
    ],
    "My": [
        {
            "handshape": "Use a flat hand with your fingers together.",
            "location": "Place your hand on the center of your chest.",
            "orientation": "Face your palm directly toward your body.",
            "nms": "Use a neutral expression.",
        }
    ],
    "Name": [
        {
            "handshape": "Extend the index and middle fingers together on both hands and close the other fingers.",
            "location": "Hold both hands in front of your upper chest.",
            "orientation": "Cross the extended fingers in an X, with your dominant hand on top.",
            "nms": "Use a neutral expression.",
        },
        {
            "handshape": "Keep the same two-finger handshape on both hands.",
            "location": "Lift the dominant hand slightly above the other hand.",
            "orientation": "Keep the hands ready to cross again.",
            "nms": "Use a neutral expression.",
        },
        {
            "handshape": "Keep the same two-finger handshape on both hands.",
            "location": "Tap the dominant fingers onto the non-dominant fingers again.",
            "orientation": "Finish with the extended fingers crossed.",
            "nms": "Use a neutral expression.",
        },
    ],
    "Nice": [
        {
            "handshape": "Use relaxed, flat hands.",
            "location": "Rest your dominant hand flat on your non-dominant palm in front of your chest.",
            "orientation": "Face the lower palm up and the upper palm down.",
            "nms": "Use a neutral expression or a pleasant smile.",
        },
        {
            "handshape": "Keep both hands flat.",
            "location": "Slide the dominant hand forward across the lower palm toward its fingertips.",
            "orientation": "Keep the lower palm up and the upper palm down.",
            "nms": "Use a neutral expression or a pleasant smile.",
        },
    ],
    "Why": [
        {
            "handshape": "Extend your thumb and pinky while curling the other fingers inward.",
            "location": "Start near the side of your forehead or temple.",
            "orientation": "Face your palm mostly inward toward your head.",
            "nms": "Lower your eyebrows slightly in a questioning expression.",
        },
        {
            "handshape": "Maintain the thumb-and-pinky handshape.",
            "location": "Move slightly outward and down from your head.",
            "orientation": "Keep your palm mostly inward.",
            "nms": "Maintain the questioning expression.",
        },
    ],
    "You": [
        {
            "handshape": "Extend your index finger and curl the other fingers into your palm.",
            "location": "Hold your dominant hand in front of your chest or shoulder.",
            "orientation": "Point your index finger toward the person you are addressing.",
            "nms": "Use a neutral expression.",
        }
    ],
}

VIDEO_FILES = {
    "Hello": "HI.mp4",
    "Meet": "MEET.mp4",
    "My": "MY.mp4",
    "Name": "NAME.mp4",
    "Nice": "NICE.mp4",
    "Why": "WHY.mp4",
    "You": "YOU.mp4",
}
