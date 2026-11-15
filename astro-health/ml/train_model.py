"""Train the lightweight LYRA astronaut wellness diagnostic MLP.

Run from the project root with:
    python ml/train_model.py

The generated JSON is intentionally framework-agnostic so the browser can
perform the same forward pass without a Python runtime or an ML dependency.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np


LABELS = [
    "Estado Nominal / Estável",
    "Síndrome Neurovestibular & SANS (Neuro-ocular)",
    "Intolerância Ortostática & Hipotensão",
    "Alerta Tromboembólico Venoso (VTE / Estase Jugular)",
    "Infecção do Trato Urinário (ITU) / Desconforto Pélvico",
    "Anemia Espacial & Fadiga Endócrina",
    "Exposição Aguda à Radiação Solar (Evento DONKI)",
    "Emergência Cardiorrespiratória Crítica",
]
FEATURE_NAMES = [
    "dor_intensidade",
    "tontura_neuro_visual",
    "fadiga_fraqueza",
    "dispneia_palpitacao",
    "sintoma_urinario_pelvico",
    "edema_assimetria_vascular",
    "regiao_afetada",
    "perfil_biologico",
    "bpm",
    "temperatura",
    "pressao_sistolica",
    "radiacao_donki",
    "estresse_facial_camera",
]


def build_dataset(samples_per_class: int = 400, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """Create balanced, reproducible emergency triage examples with controlled noise."""
    rng = np.random.default_rng(seed)
    profiles = [
        [1.0, 1.0, 1.0, 1.0, 0.0, 0.5, 0, 0, 72, 36.8, 118, 0.3, 0.8],
        [2.0, 8.0, 2.0, 1.5, 0.5, 0.5, 1, 0, 76, 36.8, 115, 0.5, 3.0],
        [2.0, 7.0, 4.0, 1.5, 0.5, 0.5, 0, 1, 88, 36.7, 88, 0.5, 3.5],
        [3.0, 3.0, 4.0, 2.0, 0.5, 8.0, 4, 1, 82, 36.9, 120, 0.8, 3.0],
        [3.0, 2.0, 3.0, 2.0, 8.0, 1.0, 3, 1, 78, 37.3, 112, 0.6, 2.5],
        [1.0, 3.0, 8.0, 1.0, 1.0, 1.0, 0, 1, 68, 36.7, 110, 0.5, 3.0],
        [2.0, 4.0, 5.0, 2.0, 1.0, 1.0, 0, 0, 82, 37.2, 120, 4.5, 4.5],
        [8.0, 6.0, 7.0, 9.0, 1.0, 1.0, 2, 0, 138, 38.2, 175, 1.0, 6.0],
    ]
    feature_ranges = np.array([10, 10, 10, 10, 10, 10, 4, 1, 22, 0.6, 22, 0.7, 10])
    rows = []
    labels = []
    for label, profile in enumerate(profiles):
        baseline = np.array(profile, dtype=float)
        noise = rng.normal(0, feature_ranges * 0.12, (samples_per_class, len(profile)))
        class_rows = baseline + noise
        class_rows[:, 0:4] = np.clip(class_rows[:, 0:4], 0, 10)
        class_rows[:, 4:6] = np.clip(class_rows[:, 4:6], 0, 10)
        class_rows[:, 6] = np.clip(np.rint(class_rows[:, 6]), 0, 4)
        class_rows[:, 7] = np.clip(np.rint(class_rows[:, 7]), 0, 1)
        class_rows[:, 8] = np.clip(class_rows[:, 8], 50, 180)
        class_rows[:, 9] = np.clip(class_rows[:, 9], 35, 41)
        class_rows[:, 10] = np.clip(class_rows[:, 10], 75, 190)
        class_rows[:, 11] = np.clip(class_rows[:, 11], 0, 5)
        class_rows[:, 12] = np.clip(class_rows[:, 12], 0, 10)
        rows.append(class_rows)
        labels.extend([label] * samples_per_class)
    features = np.vstack(rows)
    labels = np.array(labels, dtype=np.int64)
    hidden_stress = np.column_stack([
        rng.uniform(1, 2, 80),
        rng.uniform(1, 2, 80),
        rng.uniform(1, 2, 80),
        rng.uniform(0, 2, 80),
        rng.uniform(0, 1, 80),
        rng.uniform(0, 1, 80),
        rng.integers(0, 3, 80),
        rng.integers(0, 2, 80),
        rng.uniform(105, 145, 80),
        rng.uniform(36.8, 38.2, 80),
        rng.uniform(135, 175, 80),
        rng.uniform(0.5, 2.0, 80),
        rng.uniform(7, 9, 80),
    ])
    features = np.vstack([features, hidden_stress])
    labels = np.concatenate([labels, np.full(len(hidden_stress), 7, dtype=np.int64)])
    order = rng.permutation(len(labels))
    features, labels = features[order], labels[order]

    # A small amount of label noise keeps the classifier from memorizing profiles.
    noise = rng.random(len(labels)) < 0.025
    labels[noise] = rng.integers(0, len(LABELS), noise.sum())
    return features, labels


def train_model(features: np.ndarray, targets: np.ndarray, epochs: int = 12000) -> dict:
    """Train a one-hidden-layer ReLU/Softmax MLP with full-batch gradient descent."""
    min_val = features.min(axis=0)
    max_val = features.max(axis=0)
    normalized = (features - min_val) / np.maximum(max_val - min_val, 1e-8)
    classes = len(LABELS)
    hidden_units = 16
    rng = np.random.default_rng(7)
    weights_1 = rng.normal(0, np.sqrt(2 / normalized.shape[1]), (normalized.shape[1], hidden_units))
    bias_1 = np.zeros(hidden_units)
    weights_2 = rng.normal(0, np.sqrt(2 / hidden_units), (hidden_units, classes))
    bias_2 = np.zeros(classes)
    one_hot = np.eye(classes)[targets]
    learning_rate = 0.045

    for epoch in range(epochs):
        hidden_linear = normalized @ weights_1 + bias_1
        hidden = np.maximum(hidden_linear, 0)
        logits = hidden @ weights_2 + bias_2
        logits -= logits.max(axis=1, keepdims=True)
        probabilities = np.exp(logits)
        probabilities /= probabilities.sum(axis=1, keepdims=True)

        output_gradient = (probabilities - one_hot) / len(features)
        weights_2 -= learning_rate * (hidden.T @ output_gradient)
        bias_2 -= learning_rate * output_gradient.sum(axis=0)
        hidden_gradient = (output_gradient @ weights_2.T) * (hidden_linear > 0)
        weights_1 -= learning_rate * (normalized.T @ hidden_gradient)
        bias_1 -= learning_rate * hidden_gradient.sum(axis=0)

        if epoch == 5000:
            learning_rate *= 0.45

    return {
        "version": 1,
        "feature_names": FEATURE_NAMES,
        "labels": LABELS,
        "min_val": min_val.tolist(),
        "max_val": max_val.tolist(),
        "w1": weights_1.tolist(),
        "b1": bias_1.tolist(),
        "w2": weights_2.tolist(),
        "b2": bias_2.tolist(),
    }


def main() -> None:
    features, targets = build_dataset()
    model = train_model(features, targets)
    output_path = Path(__file__).resolve().parents[1] / "src" / "data" / "astro_model.json"
    output_path.write_text(json.dumps(model, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output_path} with {len(FEATURE_NAMES)} features and {len(LABELS)} labels.")


if __name__ == "__main__":
    main()
