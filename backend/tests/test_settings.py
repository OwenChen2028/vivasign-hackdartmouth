import os
import unittest
from unittest.mock import patch

from settings import AI_MODE, REFERENCE_MODE, Settings


class SettingsTest(unittest.TestCase):
    def load_settings(self, environment):
        with patch.dict(os.environ, environment, clear=True), patch("settings.load_dotenv"):
            return Settings.from_environment()

    def test_defaults_to_reference_mode_without_external_services(self):
        settings = self.load_settings({})

        self.assertEqual(settings.evaluation_mode, REFERENCE_MODE)
        self.assertTrue(settings.uses_reference_data)
        self.assertIn("http://localhost:3000", settings.cors_origins)

    def test_ai_mode_requires_complete_configuration(self):
        with self.assertRaisesRegex(ValueError, "requires GEMINI_API_KEY"):
            self.load_settings({"VIVASIGN_EVALUATION_MODE": AI_MODE})

    def test_rejects_unknown_evaluation_mode(self):
        with self.assertRaisesRegex(ValueError, "must be one of"):
            self.load_settings({"VIVASIGN_EVALUATION_MODE": "experimental"})


if __name__ == "__main__":
    unittest.main()
