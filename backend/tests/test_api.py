import base64
import unittest

from api import create_app
from settings import Settings


LOCAL_SETTINGS = Settings(
    gemini_api_key=None,
    gemini_model="gemini-2.0-flash",
    database={},
    local_mode=True,
)
TEST_IMAGE = "data:image/png;base64," + base64.b64encode(b"test image").decode()


class LocalApiTest(unittest.TestCase):
    def setUp(self):
        app = create_app(LOCAL_SETTINGS)
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def test_health_reports_local_mode(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"mode": "local", "status": "ok"})

    def test_signs_come_from_local_catalog(self):
        response = self.client.get("/signs")
        signs = response.get_json()["signs"]
        self.assertEqual(response.status_code, 200)
        self.assertIn({"entryCount": 2, "signName": "Hello"}, signs)

    def test_evaluate_validates_and_returns_local_feedback(self):
        response = self.client.post(
            "/evaluate",
            data={"signName": "Hello", "frameNumber": "1", "imageBase64": TEST_IMAGE},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("reference mode", response.get_data(as_text=True))

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


if __name__ == "__main__":
    unittest.main()
