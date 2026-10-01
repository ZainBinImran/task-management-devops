from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg

app = Flask(__name__)
CORS(app)

import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "task-database"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME", "task_management"),
    "user": os.getenv("DB_USER", "taskapp"),
    "password": os.getenv("DB_PASSWORD"),
}


def get_db_connection():
    return psycopg.connect(**DB_CONFIG)


def task_to_dict(row):
    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status": row[3],
        "priority": row[4],
        "created_at": row[5].isoformat(),
        "updated_at": row[6].isoformat(),
    }


@app.route("/api/health")
def health():
    try:
        conn = get_db_connection()
        conn.close()

        return jsonify({
            "status": "healthy",
            "database": "connected"
        }), 200

    except Exception as error:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(error)
        }), 500


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    try:
        conn = get_db_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    title,
                    description,
                    status,
                    priority,
                    created_at,
                    updated_at
                FROM tasks
                ORDER BY id DESC;
            """)

            rows = cursor.fetchall()

        conn.close()

        return jsonify([task_to_dict(row) for row in rows]), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    try:
        conn = get_db_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    title,
                    description,
                    status,
                    priority,
                    created_at,
                    updated_at
                FROM tasks
                WHERE id = %s;
            """, (task_id,))

            row = cursor.fetchone()

        conn.close()

        if row is None:
            return jsonify({"error": "Task not found"}), 404

        return jsonify(task_to_dict(row)), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    title = data.get("title")
    description = data.get("description")
    status = data.get("status", "Pending")
    priority = data.get("priority", "Medium")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    if status not in ["Pending", "In Progress", "Completed"]:
        return jsonify({"error": "Invalid status"}), 400

    if priority not in ["Low", "Medium", "High"]:
        return jsonify({"error": "Invalid priority"}), 400

    try:
        conn = get_db_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO tasks (
                    title,
                    description,
                    status,
                    priority
                )
                VALUES (%s, %s, %s, %s)
                RETURNING
                    id,
                    title,
                    description,
                    status,
                    priority,
                    created_at,
                    updated_at;
            """, (title, description, status, priority))

            row = cursor.fetchone()

        conn.commit()
        conn.close()

        return jsonify(task_to_dict(row)), 201

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    title = data.get("title")
    description = data.get("description")
    status = data.get("status")
    priority = data.get("priority")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    if status not in ["Pending", "In Progress", "Completed"]:
        return jsonify({"error": "Invalid status"}), 400

    if priority not in ["Low", "Medium", "High"]:
        return jsonify({"error": "Invalid priority"}), 400

    try:
        conn = get_db_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE tasks
                SET
                    title = %s,
                    description = %s,
                    status = %s,
                    priority = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING
                    id,
                    title,
                    description,
                    status,
                    priority,
                    created_at,
                    updated_at;
            """, (
                title,
                description,
                status,
                priority,
                task_id
            ))

            row = cursor.fetchone()

        conn.commit()
        conn.close()

        if row is None:
            return jsonify({"error": "Task not found"}), 404

        return jsonify(task_to_dict(row)), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        conn = get_db_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                DELETE FROM tasks
                WHERE id = %s
                RETURNING id;
            """, (task_id,))

            row = cursor.fetchone()

        conn.commit()
        conn.close()

        if row is None:
            return jsonify({"error": "Task not found"}), 404

        return jsonify({
            "message": "Task deleted successfully"
        }), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
