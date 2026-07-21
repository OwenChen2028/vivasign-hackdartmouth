from contextlib import contextmanager

from catalog import SIGN_DATA, VIDEO_FILES


class ReferenceSignRepository:
    def list_signs(self):
        return [
            {"signName": name, "entryCount": len(frames)}
            for name, frames in sorted(SIGN_DATA.items())
        ]

    def get_frame(self, sign_name, frame_number):
        frames = SIGN_DATA.get(sign_name, [])
        if frame_number < 1 or frame_number > len(frames):
            return None
        return frames[frame_number - 1]

    def get_frames(self, sign_name):
        return SIGN_DATA.get(sign_name, [])

    def get_video(self, sign_name):
        return VIDEO_FILES.get(sign_name)


class PostgresSignRepository:
    def __init__(self, database_config):
        self.database_config = database_config

    @contextmanager
    def _cursor(self):
        import psycopg2

        connection = psycopg2.connect(**self.database_config)
        try:
            with connection.cursor() as cursor:
                yield cursor
        finally:
            connection.close()

    def list_signs(self):
        with self._cursor() as cursor:
            cursor.execute(
                """
                SELECT signName, COUNT(*) AS entryCount
                FROM sign_data
                GROUP BY signName
                ORDER BY signName ASC;
                """
            )
            return [
                {"signName": name, "entryCount": count}
                for name, count in cursor.fetchall()
            ]

    def get_frame(self, sign_name, frame_number):
        with self._cursor() as cursor:
            cursor.execute(
                """
                SELECT handShapeDescription, locationDescription,
                       orientationDescription, facialExpressionDescription
                FROM sign_data
                WHERE signName = %s AND frameNumber = %s;
                """,
                (sign_name, frame_number),
            )
            row = cursor.fetchone()
        return self._frame_from_row(row) if row else None

    def get_frames(self, sign_name):
        with self._cursor() as cursor:
            cursor.execute(
                """
                SELECT handShapeDescription, locationDescription,
                       orientationDescription, facialExpressionDescription
                FROM sign_data
                WHERE signName = %s
                ORDER BY frameNumber ASC;
                """,
                (sign_name,),
            )
            return [self._frame_from_row(row) for row in cursor.fetchall()]

    def get_video(self, sign_name):
        with self._cursor() as cursor:
            cursor.execute(
                "SELECT videoUrl FROM sign_videos WHERE signName = %s;",
                (sign_name,),
            )
            row = cursor.fetchone()
        return row[0] if row else None

    @staticmethod
    def _frame_from_row(row):
        return {
            "handshape": row[0],
            "location": row[1],
            "orientation": row[2],
            "nms": row[3],
        }
