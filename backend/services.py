import logging
import os
import tempfile


logger = logging.getLogger(__name__)


def build_instruction(sign_name, frames):
    steps = []
    for index, frame in enumerate(frames, start=1):
        steps.append(
            f"Step {index}: {frame['handshape']} {frame['location']} "
            f"{frame['orientation']} {frame['nms']}"
        )
    return "\n\n".join(steps)


class ReferenceEvaluationService:
    def evaluate(self, sign_name, frame_number, frame, _image_data, _mime_type):
        return f"Frame {frame_number} of {sign_name} captured."


class GeminiEvaluationService:
    def __init__(self, api_key, model, client=None):
        if client is None:
            from google import genai

            client = genai.Client(api_key=api_key)

        self.client = client
        self.model = model

    def evaluate(self, sign_name, frame_number, frame, image_data, mime_type):
        uploaded_file = None
        temporary_path = None
        try:
            suffix = ".png" if mime_type == "image/png" else ".jpg"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
                temporary_file.write(image_data)
                temporary_path = temporary_file.name
            uploaded_file = self.client.files.upload(file=temporary_path)
            response = self.client.models.generate_content(
                model=self.model,
                contents=[uploaded_file, self._evaluation_prompt(sign_name, frame_number, frame)],
            )
            return response.text
        finally:
            if uploaded_file:
                try:
                    self.client.files.delete(name=uploaded_file.name)
                except Exception as error:
                    logger.warning("Could not delete uploaded Gemini file: %s", error)
            if temporary_path:
                try:
                    os.unlink(temporary_path)
                except FileNotFoundError:
                    logger.debug("Temporary evaluation image was already removed.")

    @staticmethod
    def _evaluation_prompt(sign_name, frame_number, frame):
        return f"""
Do not preface your response. First verify that the image plausibly shows a person attempting
sign language. If it does not show hands, say that it is unsuitable for feedback and stop.
Otherwise, address the learner directly in one paragraph. Evaluate only keyframe {frame_number}
of the ASL sign '{sign_name}', naturally discussing handshape, location, palm orientation, and
non-manual signals. Apply a balanced standard and check each reference category. Say that the
frame looks correct only when all clearly visible required features substantially align; do not
call it correct merely because the overall sign is recognizable. Report every clear mismatch in
handshape, location, palm orientation, or non-manual signals, even when the overall sign remains
recognizable. Accept natural variation when it does not change a required feature, and do not
invent issues or speculate about details that are hidden, blurred, or ambiguous. Finish by
saying how recognizable this frame is.

Reference:
Handshape: {frame['handshape']}
Location: {frame['location']}
Palm orientation: {frame['orientation']}
Non-manual signals: {frame['nms']}
""".strip()
