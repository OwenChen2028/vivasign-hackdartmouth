import os
import unittest
from types import SimpleNamespace

from services import GeminiEvaluationService


FRAME = {
    "handshape": "Flat hand.",
    "location": "Near the forehead.",
    "orientation": "Palm forward.",
    "nms": "Friendly expression.",
}


class FakeFiles:
    def __init__(self):
        self.temporary_path = None
        self.deleted_name = None

    def upload(self, file):
        self.temporary_path = file
        return SimpleNamespace(name="uploaded-frame")

    def delete(self, name):
        self.deleted_name = name


class FakeModels:
    def generate_content(self, **_kwargs):
        return SimpleNamespace(text="Keep your palm facing forward.")


class GeminiEvaluationServiceTest(unittest.TestCase):
    def test_evaluate_cleans_up_local_and_uploaded_files(self):
        client = SimpleNamespace(files=FakeFiles(), models=FakeModels())
        service = GeminiEvaluationService(None, "test-model", client=client)

        result = service.evaluate("Hello", 1, FRAME, b"image", "image/png")

        self.assertEqual(result, "Keep your palm facing forward.")
        self.assertEqual(client.files.deleted_name, "uploaded-frame")
        self.assertFalse(os.path.exists(client.files.temporary_path))


if __name__ == "__main__":
    unittest.main()
