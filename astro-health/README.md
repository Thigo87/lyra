# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Biomedical Diagnostic MLP

The browser diagnostic uses a deterministic NumPy-trained multilayer
perceptron exported as `src/data/astro_model.json`. The model accepts 13
features: six symptom scores, affected anatomical zone, biological profile,
heart rate, temperature, systolic blood pressure, DONKI radiation dose, and
facial-camera stress. It maps those inputs through a 32-unit ReLU hidden layer
and an eight-class softmax output matching the diagnostic labels used by
`src/utils/neuralDiagnostic.js`.

`ml/train_model.py` generates 500 samples per class (4,000 total) using
truncated Gaussian distributions. The ranges are anchored to published
spaceflight observations and terrestrial clinical reference thresholds:

- NASA NTRS 19980008369 for plasma-volume contraction and orthostatic
  intolerance.
- NASA OS-574 and the WISE-2005 bed-rest study for orthostatic heart-rate
  response and female countermeasure sensitivity.
- Marshall-Goebel et al., *JAMA Network Open* (2019), for internal jugular
  vein area expansion and venous stasis risk.
- Trudel et al., *Nature Medicine* (2022), for the 54% increase in hemolysis
  during spaceflight.
- NASA RR-9 tonometry findings and [PMC8409923](https://pmc.ncbi.nlm.nih.gov/articles/PMC8409923/)
  for neurovestibular and SANS-related ocular signals.
- DONKI and ISS radiation-monitoring scenarios for solar-particle-event
  radiation ranges.

Twenty-five percent of non-nominal samples intentionally combine low declared
symptom sliders with high facial stress and altered vital signs. This models
facial-telemetry incongruence without changing the eight diagnostic labels.
Training runs for 15,000 full-batch epochs with an 80/20 stratified validation
split and prints per-class validation accuracy before writing the JSON model.
The generated dataset is a reproducible engineering calibration aid, not a
clinical dataset or a substitute for physician assessment.
