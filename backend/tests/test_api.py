import base64
import unittest
from unittest.mock import patch

from api import create_app
from settings import AI_MODE, REFERENCE_MODE, Settings


REFERENCE_SETTINGS = Settings(
    evaluation_mode=REFERENCE_MODE,
    gemini_api_key=None,
    gemini_model="gemini-3.6-flash",
    database={},
)
TEST_IMAGE = "data:image/png;base64," + base64.b64encode(b"test image").decode()
TEST_FRAME = {
    "handshape": "Keep both index fingers pointing upward.",
    "location": "Bring your hands together in front of your chest.",
    "orientation": "Keep your palms facing each other.",
    "nms": "Use a neutral expression.",
}


class ReferenceApiTest(unittest.TestCase):
    def setUp(self):
        app = create_app(REFERENCE_SETTINGS)
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def test_health_reports_reference_mode(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"mode": "reference", "status": "ok"})

    def test_signs_come_from_reference_catalog(self):
        response = self.client.get("/signs")
        signs = response.get_json()["signs"]
        self.assertEqual(response.status_code, 200)
        self.assertIn({"entryCount": 2, "signName": "Hello"}, signs)

    def test_evaluate_returns_reference_mode_metadata(self):
        response = self.client.post(
            "/evaluate",
            data={"signName": "Hello", "frameNumber": "1", "imageBase64": TEST_IMAGE},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_data(as_text=True), "Frame 1 of Hello captured.")
        self.assertEqual(response.headers["X-VivaSign-Evaluation-Mode"], "reference")

    def test_evaluate_rejects_an_unknown_frame(self):
        response = self.client.post(
            "/evaluate",
            data={"signName": "Hello", "frameNumber": "99", "imageBase64": TEST_IMAGE},
        )
        self.assertEqual(response.status_code, 404)

    def test_reference_endpoints_work_locally(self):
        explanation = self.client.get("/explain?signName=My")
        video = self.client.get("/video?signName=My")
        self.assertEqual(explanation.status_code, 200)
        self.assertIn("Step 1", explanation.get_data(as_text=True))
        self.assertEqual(video.status_code, 200)
        self.assertIn("/media/MY.mp4", video.get_data(as_text=True))

    def test_unknown_route_is_a_404(self):
        response = self.client.get("/not-a-route")
        self.assertEqual(response.status_code, 404)


class AiInstructionApiTest(unittest.TestCase):
    @patch("api.GeminiEvaluationService")
    @patch("api.PostgresSignRepository")
    def test_instructions_use_database_rows_without_calling_gemini(
        self, repository_class, evaluation_service_class
    ):
        repository_class.return_value.get_frames.return_value = [TEST_FRAME]
        repository_class.return_value.get_video.return_value = "MEET.mp4"
        settings = Settings(
            evaluation_mode=AI_MODE,
            gemini_api_key="test-key",
            gemini_model="gemini-3.6-flash",
            database={"host": "database"},
        )
        app = create_app(settings)
        app.config.update(TESTING=True)

        response = app.test_client().get("/explain?signName=Meet")
        video = app.test_client().get("/video?signName=Meet")
        media = app.test_client().get("/media/MEET.mp4")

        self.assertEqual(response.status_code, 200)
        self.assertIn("Step 1", response.get_data(as_text=True))
        self.assertIn("/media/MEET.mp4", video.get_data(as_text=True))
        self.assertEqual(media.status_code, 200)
        media.close()
        repository_class.return_value.get_frames.assert_called_once_with("Meet")
        evaluation_service_class.return_value.explain.assert_not_called()


if __name__ == "__main__":
    unittest.main()
