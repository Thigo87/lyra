"""Train the lightweight LYRA astronaut wellness diagnostic MLP.

Run from the project root with:
    python ml/train_model.py

The generated JSON is framework-agnostic so the browser can perform the same
forward pass without a Python runtime or an ML dependency.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np


LABELS = [
    "Nominal / Stable Condition",
    "Spaceflight Neurovestibular & SANS Syndrome",
    "Orthostatic Intolerance & Hypotension",
    "Venous Thromboembolism Alert (VTE / Jugular Stasis)",
    "Urinary Tract Infection (UTI) / Pelvic Discomfort",
    "Spaceflight Anemia & Endocrine Fatigue",
    "Acute Solar Radiation Exposure (DONKI Event)",
    "Critical Cardiorespiratory Emergency",
]
FEATURE_NAMES = [
    "pain_intensity",
    "neuro_visual_dizziness",
    "fatigue_weakness",
    "dyspnea_palpitations",
    "urinary_pelvic_symptoms",
    "vascular_edema_asymmetry",
    "affected_zone",
    "biological_profile",
    "heart_rate_bpm",
    "temperature_celsius",
    "systolic_blood_pressure",
    "donki_radiation",
    "facial_camera_stress",
]


def truncated_normal(
    rng: np.random.Generator,
    mean: float,
    standard_deviation: float,
    lower: float,
    upper: float,
    size: int,
) -> np.ndarray:
    """Draw values from a Gaussian distribution bounded by clinical limits."""
    values = np.empty(size, dtype=float)
    remaining = np.ones(size, dtype=bool)
    while remaining.any():
        count = int(remaining.sum())
        candidates = rng.normal(mean, standard_deviation, count)
        accepted = (candidates >= lower) & (candidates <= upper)
        indices = np.flatnonzero(remaining)
        values[indices[accepted]] = candidates[accepted]
        remaining[indices[accepted]] = False
    return values


def draw_feature(
    rng: np.random.Generator,
    size: int,
    mean: float,
    standard_deviation: float,
    lower: float,
    upper: float,
) -> np.ndarray:
    return truncated_normal(rng, mean, standard_deviation, lower, upper, size)


def build_class_samples(
    rng: np.random.Generator,
    class_index: int,
    samples_per_class: int,
) -> np.ndarray:
    """Generate one clinically anchored class with the 13 runtime features."""
    rows = np.zeros((samples_per_class, len(FEATURE_NAMES)), dtype=float)

    # All symptom sliders use a 0-10 scale and are intentionally bounded.
    symptom_specs = {
        0: (0.8, 0.7, 0, 2),
        1: (1.0, 0.8, 0, 2),
        2: (1.0, 0.8, 0, 2),
        3: (0.8, 0.7, 0, 2),
        4: (0.7, 0.7, 0, 2),
        5: (0.7, 0.7, 0, 2),
    }
    for feature_index, specification in symptom_specs.items():
        rows[:, feature_index] = draw_feature(rng, samples_per_class, *specification)

    # NASA-anchored ranges are kept explicit so the generated data remains auditable.
    if class_index == 0:
        rows[:, 6] = 0
        rows[:, 7] = rng.binomial(1, 0.5, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 64, 6, 55, 72)
        rows[:, 9] = draw_feature(rng, samples_per_class, 36.6, 0.15, 36.3, 36.9)
        rows[:, 10] = draw_feature(rng, samples_per_class, 118, 5, 112, 126)
        rows[:, 11] = draw_feature(rng, samples_per_class, 0.3, 0.25, 0, 0.8)
        rows[:, 12] = draw_feature(rng, samples_per_class, 1, 0.7, 0, 2)
    elif class_index == 1:
        rows[:, 1] = draw_feature(rng, samples_per_class, 8, 1.1, 6, 10)
        rows[:, 0] = draw_feature(rng, samples_per_class, 7, 1.1, 5, 9)
        rows[:, 6] = 1
        rows[:, 7] = rng.binomial(1, 0.5, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 88, 8, 74, 102)
        rows[:, 9] = draw_feature(rng, samples_per_class, 36.9, 0.25, 36.3, 37.6)
        rows[:, 10] = draw_feature(rng, samples_per_class, 134, 6, 124, 144)
        rows[:, 11] = draw_feature(rng, samples_per_class, 0.6, 0.4, 0, 1.5)
        rows[:, 12] = draw_feature(rng, samples_per_class, 7.8, 1.1, 5.5, 10)
    elif class_index == 2:
        rows[:, 1] = draw_feature(rng, samples_per_class, 8, 1.1, 6, 10)
        rows[:, 2] = draw_feature(rng, samples_per_class, 7.5, 1, 6, 9)
        rows[:, 6] = 4
        rows[:, 7] = rng.binomial(1, 0.7, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 123, 10, 105, 142)
        rows[:, 9] = draw_feature(rng, samples_per_class, 36.7, 0.2, 36.1, 37.4)
        rows[:, 10] = draw_feature(rng, samples_per_class, 85, 5, 76, 95)
        rows[:, 11] = draw_feature(rng, samples_per_class, 0.7, 0.4, 0, 1.8)
        rows[:, 12] = draw_feature(rng, samples_per_class, 7.8, 1.1, 5.5, 10)
    elif class_index == 3:
        rows[:, 5] = draw_feature(rng, samples_per_class, 8.5, 1, 7, 10)
        rows[:, 0] = draw_feature(rng, samples_per_class, 6.5, 1, 5, 8)
        rows[:, 6] = rng.choice([1, 4], samples_per_class, p=[0.6, 0.4])
        rows[:, 7] = rng.binomial(1, 0.55, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 110, 4, 100, 116)
        rows[:, 9] = draw_feature(rng, samples_per_class, 37.2, 0.1, 37.0, 37.5)
        rows[:, 10] = draw_feature(rng, samples_per_class, 136, 4, 120, 145)
        rows[:, 11] = draw_feature(rng, samples_per_class, 0.8, 0.45, 0, 2)
        rows[:, 12] = draw_feature(rng, samples_per_class, 7.2, 1.2, 4.5, 10)
    elif class_index == 4:
        rows[:, 4] = draw_feature(rng, samples_per_class, 8.5, 1, 7, 10)
        rows[:, 6] = 3
        rows[:, 7] = rng.binomial(1, 0.75, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 101, 8, 88, 115)
        rows[:, 9] = draw_feature(rng, samples_per_class, 38.3, 0.35, 37.8, 39.1)
        rows[:, 10] = draw_feature(rng, samples_per_class, 116, 9, 95, 140)
        rows[:, 11] = draw_feature(rng, samples_per_class, 0.7, 0.4, 0, 1.8)
        rows[:, 12] = draw_feature(rng, samples_per_class, 7.3, 1.2, 4.5, 10)
    elif class_index == 5:
        rows[:, 2] = draw_feature(rng, samples_per_class, 8.5, 1, 7, 10)
        rows[:, 3] = draw_feature(rng, samples_per_class, 6, 1.1, 4, 8)
        rows[:, 6] = 4
        rows[:, 7] = rng.binomial(1, 0.5, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 107, 8, 92, 122)
        rows[:, 9] = draw_feature(rng, samples_per_class, 36.6, 0.2, 36.2, 36.9)
        rows[:, 10] = draw_feature(rng, samples_per_class, 102, 5, 94, 110)
        rows[:, 11] = draw_feature(rng, samples_per_class, 0.6, 0.35, 0, 1.5)
        rows[:, 12] = draw_feature(rng, samples_per_class, 7, 1.2, 4.5, 10)
    elif class_index == 6:
        rows[:, 2] = draw_feature(rng, samples_per_class, 8, 1.1, 6, 10)
        rows[:, 1] = draw_feature(rng, samples_per_class, 7, 1.1, 5, 9)
        rows[:, 6] = 4
        rows[:, 7] = rng.binomial(1, 0.5, samples_per_class)
        rows[:, 8] = draw_feature(rng, samples_per_class, 113, 9, 95, 132)
        rows[:, 9] = draw_feature(rng, samples_per_class, 38.1, 0.4, 37.4, 38.9)
        rows[:, 10] = draw_feature(rng, samples_per_class, 124, 10, 100, 150)
        rows[:, 11] = draw_feature(rng, samples_per_class, 3.9, 0.45, 2.8, 5)
        rows[:, 12] = draw_feature(rng, samples_per_class, 7.8, 1.1, 5, 10)
    elif class_index == 7:
        rows[:, 0] = draw_feature(rng, samples_per_class, 9, 0.8, 8, 10)
        rows[:, 3] = draw_feature(rng, samples_per_class, 9, 0.8, 8, 10)
        rows[:, 6] = 2
        rows[:, 7] = rng.binomial(1, 0.5, samples_per_class)
        critical_profiles = rng.binomial(1, 0.5, samples_per_class)
        rows[:, 8] = np.where(
            critical_profiles == 0,
            draw_feature(rng, samples_per_class, 158, 10, 138, 180),
            draw_feature(rng, samples_per_class, 42, 3, 35, 46),
        )
        rows[:, 9] = draw_feature(rng, samples_per_class, 38.4, 0.5, 37.2, 40.2)
        rows[:, 10] = np.where(
            rng.binomial(1, 0.5, samples_per_class) == 0,
            draw_feature(rng, samples_per_class, 72, 5, 55, 79),
            draw_feature(rng, samples_per_class, 178, 8, 166, 190),
        )
        rows[:, 11] = draw_feature(rng, samples_per_class, 1.5, 0.7, 0, 4)
        rows[:, 12] = draw_feature(rng, samples_per_class, 8.8, 0.8, 7, 10)
    else:
        raise ValueError(f"Unknown class index: {class_index}")

    # Twenty-five percent of non-nominal cases simulate low declared symptoms
    # while the camera and altered vital signs retain the emergency signal.
    if class_index > 0:
        hidden_count = samples_per_class // 4
        hidden_indices = rng.choice(samples_per_class, hidden_count, replace=False)
        rows[hidden_indices, 0:6] = rng.uniform(1, 3, (hidden_count, 6))
        rows[hidden_indices, 12] = rng.uniform(7.5, 10, hidden_count)

    return rows


def build_dataset(samples_per_class: int = 500, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """Create 500 reproducible, balanced samples for each diagnostic class."""
    if samples_per_class != 500:
        raise ValueError("The calibrated dataset requires exactly 500 samples per class.")
    rng = np.random.default_rng(seed)
    features = np.vstack([
        build_class_samples(rng, class_index, samples_per_class)
        for class_index in range(len(LABELS))
    ])
    targets = np.repeat(np.arange(len(LABELS), dtype=np.int64), samples_per_class)
    order = rng.permutation(len(targets))
    return features[order], targets[order]


def stratified_split(
    features: np.ndarray,
    targets: np.ndarray,
    validation_fraction: float = 0.2,
    seed: int = 11,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Split each diagnostic class into deterministic training and validation sets."""
    rng = np.random.default_rng(seed)
    train_indices = []
    validation_indices = []
    for class_index in range(len(LABELS)):
        class_indices = np.flatnonzero(targets == class_index)
        shuffled = rng.permutation(class_indices)
        split = int(len(shuffled) * (1 - validation_fraction))
        train_indices.extend(shuffled[:split])
        validation_indices.extend(shuffled[split:])
    return (
        features[train_indices],
        targets[train_indices],
        features[validation_indices],
        targets[validation_indices],
    )


def forward(
    normalized: np.ndarray,
    weights_1: np.ndarray,
    bias_1: np.ndarray,
    weights_2: np.ndarray,
    bias_2: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    hidden_linear = normalized @ weights_1 + bias_1
    hidden = np.maximum(hidden_linear, 0)
    logits = hidden @ weights_2 + bias_2
    logits -= logits.max(axis=1, keepdims=True)
    probabilities = np.exp(logits)
    probabilities /= probabilities.sum(axis=1, keepdims=True)
    return hidden_linear, probabilities


def train_model(
    train_features: np.ndarray,
    train_targets: np.ndarray,
    validation_features: np.ndarray,
    validation_targets: np.ndarray,
    epochs: int = 15000,
) -> tuple[dict, np.ndarray]:
    """Train a one-hidden-layer ReLU/Softmax MLP with full-batch gradient descent."""
    min_val = train_features.min(axis=0)
    max_val = train_features.max(axis=0)
    train_normalized = (train_features - min_val) / np.maximum(max_val - min_val, 1e-8)
    validation_normalized = (validation_features - min_val) / np.maximum(max_val - min_val, 1e-8)
    classes = len(LABELS)
    hidden_units = 32
    rng = np.random.default_rng(7)
    weights_1 = rng.normal(0, np.sqrt(2 / train_normalized.shape[1]), (train_normalized.shape[1], hidden_units))
    bias_1 = np.zeros(hidden_units)
    weights_2 = rng.normal(0, np.sqrt(2 / hidden_units), (hidden_units, classes))
    bias_2 = np.zeros(classes)
    one_hot = np.eye(classes)[train_targets]
    learning_rate = 0.06

    for epoch in range(epochs):
        hidden_linear, probabilities = forward(train_normalized, weights_1, bias_1, weights_2, bias_2)
        output_gradient = (probabilities - one_hot) / len(train_features)
        weights_2 -= learning_rate * (np.maximum(hidden_linear, 0).T @ output_gradient)
        bias_2 -= learning_rate * output_gradient.sum(axis=0)
        hidden_gradient = (output_gradient @ weights_2.T) * (hidden_linear > 0)
        weights_1 -= learning_rate * (train_normalized.T @ hidden_gradient)
        bias_1 -= learning_rate * hidden_gradient.sum(axis=0)
        if epoch == 6000:
            learning_rate *= 0.45
        elif epoch == 11000:
            learning_rate *= 0.45

    _, validation_probabilities = forward(
        validation_normalized,
        weights_1,
        bias_1,
        weights_2,
        bias_2,
    )
    validation_predictions = validation_probabilities.argmax(axis=1)
    print("Validation accuracy by class:")
    for class_index, label in enumerate(LABELS):
        class_mask = validation_targets == class_index
        accuracy = np.mean(validation_predictions[class_mask] == class_index) * 100
        print(f"  {label}: {accuracy:.2f}%")
    print(f"Overall validation accuracy: {np.mean(validation_predictions == validation_targets) * 100:.2f}%")

    return {
        "version": 2,
        "feature_names": FEATURE_NAMES,
        "labels": LABELS,
        "min_val": min_val.tolist(),
        "max_val": max_val.tolist(),
        "w1": weights_1.tolist(),
        "b1": bias_1.tolist(),
        "w2": weights_2.tolist(),
        "b2": bias_2.tolist(),
    }, validation_predictions


def main() -> None:
    features, targets = build_dataset()
    train_features, train_targets, validation_features, validation_targets = stratified_split(features, targets)
    model, _ = train_model(train_features, train_targets, validation_features, validation_targets)
    output_path = Path(__file__).resolve().parents[1] / "src" / "data" / "astro_model.json"
    output_path.write_text(json.dumps(model, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {output_path} with {len(features)} samples, "
        f"{len(FEATURE_NAMES)} features, and {len(LABELS)} labels."
    )


if __name__ == "__main__":
    main()
