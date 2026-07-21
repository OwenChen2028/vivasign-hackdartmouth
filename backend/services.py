import os
import tempfile


def build_instruction(sign_name, frames):
    steps = []
    for index, frame in enumerate(frames, start=1):
        steps.append(
            f"Step {index}: {frame['handshape']} {frame['location']} "
            f"{frame['orientation']} {frame['nms']}"
        )
    return " ".join(steps)


class LocalEvaluationService:
    def evaluate(self, sign_name, frame_number, frame, _image_data, _mime_type):
        return (
            f"Frame {frame_number} was captured for {sign_name}. Compare the captured pose with "
            f"this reference: {frame['handshape']} {frame['location']} {frame['orientation']} "
            f"{frame['nms']} This installation is running in reference mode, which provides "
            "practice guidance without visually scoring the image."
        )

    def explain(self, sign_name, frames):
        return build_instruction(sign_name, frames)


class GeminiEvaluationService:
    def __init__(self, api_key, model):
        from google import genai

        self.client = genai.Client(api_key=api_key)
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
                except Exception:
                    pass
            if temporary_path:
                try:
                    os.unlink(temporary_path)
                except FileNotFoundError:
                    pass

    def explain(self, sign_name, frames):
        prompt = (
            "Rewrite these ASL reference steps as concise, beginner-friendly instructions. "
            "Address the learner directly, preserve every step, and do not add an introduction.\n\n"
            f"Sign: {sign_name}\n{build_instruction(sign_name, frames)}"
        )
        response = self.client.models.generate_content(model=self.model, contents=[prompt])
        return response.text

    @staticmethod
    def _evaluation_prompt(sign_name, frame_number, frame):
        return f"""
Do not preface your response. First verify that the image plausibly shows a person attempting
sign language. If it does not show hands, say that it is unsuitable for feedback and stop.
Otherwise, address the learner directly in one paragraph. Evaluate only keyframe {frame_number}
of the ASL sign '{sign_name}', naturally discussing handshape, location, palm orientation, and
non-manual signals. Finish by saying how recognizable this frame is.

Reference:
Handshape: {frame['handshape']}
Location: {frame['location']}
Palm orientation: {frame['orientation']}
Non-manual signals: {frame['nms']}
""".strip()
