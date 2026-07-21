import base64
import binascii
import re

from flask import Flask, jsonify, request, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from catalog import SIGN_EXAMPLES_DIRECTORY
from settings import Settings
from repositories import PostgresSignRepository, ReferenceSignRepository
from services import (
    GeminiEvaluationService,
    ReferenceEvaluationService,
    build_instruction,
)


DATA_URL_PATTERN = re.compile(r"^data:(image/(?:png|jpeg));base64,(.+)$", re.DOTALL)
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_REQUEST_BYTES = 12 * 1024 * 1024


def create_app(settings=None):
    settings = settings or Settings.from_environment()
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_REQUEST_BYTES
    CORS(
        app,
        resources={r"/*": {"origins": settings.cors_origins}},
        expose_headers=["X-VivaSign-Evaluation-Mode"],
    )

    repository = (
        ReferenceSignRepository()
        if settings.uses_reference_data
        else PostgresSignRepository(settings.database)
    )
    evaluation_service = (
        ReferenceEvaluationService()
        if settings.uses_reference_data
        else GeminiEvaluationService(settings.gemini_api_key, settings.gemini_model)
    )

    @app.get("/health")
    def health():
        return jsonify(status="ok", mode=settings.evaluation_mode)

    @app.get("/signs")
    def get_signs():
        return jsonify(signs=repository.list_signs())

    @app.post("/evaluate")
    def evaluate_keyframe():
        sign_name = request.form.get("signName", "").strip()
        frame_number = _positive_integer(request.form.get("frameNumber"))
        image_value = request.form.get("imageBase64", "")

        if not sign_name:
            return _error("Missing required parameter: 'signName'.")
        if frame_number is None:
            return _error("'frameNumber' must be a positive integer.")
        frame = repository.get_frame(sign_name, frame_number)
        if not frame:
            return _error(f"No data found for '{sign_name}' at frame {frame_number}.", 404)

        try:
            image_data, mime_type = _decode_image(image_value)
        except ValueError as error:
            return _error(str(error))

        try:
            feedback = evaluation_service.evaluate(
                sign_name, frame_number, frame, image_data, mime_type
            )
        except Exception as error:
            app.logger.exception("Evaluation failed: %s", error)
            return _error("Image evaluation failed.", 502)
        return feedback, 200, {
            "Content-Type": "text/plain; charset=utf-8",
            "X-VivaSign-Evaluation-Mode": settings.evaluation_mode,
        }

    @app.get("/explain")
    def generate_instruction():
        sign_name = request.args.get("signName", "").strip()
        if not sign_name:
            return _error("Missing required query parameter: 'signName'.")
        frames = repository.get_frames(sign_name)
        if not frames:
            return _error(f"No data found for sign '{sign_name}'.", 404)
        return build_instruction(sign_name, frames)

    @app.get("/video")
    def get_video():
        sign_name = request.args.get("signName", "").strip()
        if not sign_name:
            return _error("Missing required query parameter: 'signName'.")
        video = repository.get_video(sign_name)
        if not video:
            return _error(f"No video found for sign '{sign_name}'.", 404)
        if settings.uses_reference_data:
            return url_for("get_reference_video", filename=video, _external=True)
        return video

    @app.get("/media/<path:filename>")
    def get_reference_video(filename):
        if not settings.uses_reference_data:
            return _error("Bundled reference media is disabled.", 404)
        return send_from_directory(SIGN_EXAMPLES_DIRECTORY, filename)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        if isinstance(error, HTTPException):
            return _error(error.description, error.code)
        app.logger.exception("Unhandled API error: %s", error)
        return _error("Unexpected server error.", 500)

    return app


def _positive_integer(value):
    try:
        number = int(value)
        return number if number > 0 else None
    except (TypeError, ValueError):
        return None


def _decode_image(value):
    match = DATA_URL_PATTERN.fullmatch(value)
    if not match:
        raise ValueError("'imageBase64' must be a PNG or JPEG data URL.")
    try:
        image_data = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValueError("'imageBase64' contains invalid base64 data.") from error
    if not image_data:
        raise ValueError("'imageBase64' contains an empty image.")
    if len(image_data) > MAX_IMAGE_BYTES:
        raise ValueError("The image exceeds the 8 MB upload limit.")
    return image_data, match.group(1)


def _error(message, status=400):
    return jsonify(error=message), status


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
