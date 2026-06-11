# Brain x AI 101

Brain x AI 101 is an interactive educational website built with React and Vite. It teaches students how ideas from biology connect to artificial intelligence, and it does that through guided interaction rather than static explanation.

This project is designed for a K-12 audience, but it is not written down to them. The experience treats students as capable learners who can understand complex systems when those systems are made visible, concrete, and intuitive.

## Project Goal

The site answers one big question:

How do simple signals become recognition, and how does recognition become learning?

The course is structured as a progression:

1. Start with the biological neuron.
2. Translate that idea into artificial neural networks.
3. Show how feedback changes a system over time.

That progression is the core design decision behind the project. Each module exists to prepare students for the next one.

## Learning Design

Brain x AI 101 is not a glossary of AI terms. It is a teaching sequence built to help students form a mental model.

The course does three things on purpose:

- It begins with biology so students can anchor abstract AI ideas in a real physical system.
- It turns invisible processes into visible interactions so learners can watch cause and effect happen.
- It ends with learning and feedback so students understand that AI systems improve by changing internal connections, not by "just knowing."

## Modules

### Module 1: Biological Neurons

**What it teaches**

Module 1 teaches that a neuron receives signals, combines them, and fires when the total passes a threshold.

**Why this module comes first**

Students hear the phrase "neural network" long before they understand the neuron behind the metaphor. This module fixes that. It gives students a grounded starting point before the course introduces computation.

**What misconception it corrects**

Students often imagine intelligence as something mysterious or all-or-nothing. This module shows that complex behavior can begin with a simple input-response system.

**What students should leave with**

Students should understand inputs, thresholds, selective response, and firing. They should be able to explain that a neuron does not react equally to everything around it.

**How the interaction supports the lesson**

The sound experiment, soma meter, hotspot anatomy sequence, and embedded neuron simulation turn an abstract process into something students can test and observe. The bridge section then connects that biological process directly to the structure of an artificial neuron.

### Module 2: Pattern Recognition

**What it teaches**

Module 2 teaches that artificial neurons and layered networks detect patterns by applying weights, activations, and filters to inputs.

**Why this module exists**

Once students understand a biological neuron, they need to see what AI keeps and what AI changes. This module makes that translation clear. It shows that AI does not copy biology literally; it borrows a useful idea and turns it into computation.

**What misconception it corrects**

Students often think AI "sees" or "understands" the way people do. This module replaces that intuition with a more accurate one: AI systems respond to structured features, weighted signals, and learned patterns.

**What students should leave with**

Students should understand artificial neurons, layers, activation functions, selectivity, and the role of convolution in image recognition.

**How the interaction supports the lesson**

The staged network builds, activation demos, selectivity activities, and CNN scanning lab reveal how small numerical operations create larger recognition behavior. Students do not just hear that filters matter; they watch filter choices change results.

### Module 3: Learning and Feedback

**What it teaches**

Module 3 teaches that intelligent behavior improves through feedback. Predictions produce error, error changes weights, and changed weights alter future behavior.

**Why this module exists**

Understanding structure is not enough. Students also need to understand change. This module answers the question that matters most after Modules 1 and 2: how does a network get better?

**What misconception it corrects**

Students often think learning in AI is a single trick or a black box. This module shows that learning is a process of adjustment driven by targets, rewards, consequences, and error signals.

**What students should leave with**

Students should understand that learning means updating internal connections in response to feedback, and that different learning methods solve that problem in different ways.

**How the interaction supports the lesson**

The prediction-and-error walkthroughs, clustering lab, reinforcement learning activity, and backpropagation sequence make learning visible as a step-by-step process. The final bridge shows how the single-neuron idea scales into deeper systems that can improve over time.

## User Flow

The current application flow is:

1. Landing Page
2. Pre-Course Evaluation
3. Module 1
4. Module 2
5. Module 3
6. Course Evaluation
7. Completion Screen

The app uses Redux-backed app-level view state for navigation. It does not use React Router.

## Tech Stack

- React 19
- Vite
- Redux Toolkit
- Framer Motion
- Three.js / React Three Fiber
- GSAP
- ONNX Runtime Web
- Prisma
- PostgreSQL
- Vercel Functions

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Start the full local app with Vercel Functions:

```bash
npm run dev:full
```

Use `npm run dev:full` when you need backend-powered features locally, including certificate generation and admin API routes. `npm run dev` runs the Vite frontend only.

Create a production build:

```bash
npm run build
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Run database migrations locally:

```bash
npm run prisma:migrate:dev
```

Seed the module/question metadata:

```bash
npm run prisma:seed
```

Run the test suite:

```bash
npm run test:run
```

Deploy the `dist` folder to GitHub Pages:

```bash
npm run deploy
```

GitHub Pages is a static deploy target. Frontend pages render there, but backend-powered features such as certificate generation and admin/server APIs will not work.

Deploy to Vercel with backend support:

```bash
npm run vercel-build
```

For production, use Vercel when you need:

- certificate generation from the Word template
- admin data access
- quiz/evaluation submission APIs

## Project Structure

```text
src/
  components/
    ui/
  lib/
  modules/
    CourseEvaluation/
    Module1/
    Module2/
    Module3/
  pages/
  hooks/
api/
prisma/
public/
scripts/
```

## Implementation Notes

- Each module owns its own content and section composition.
- Shared UI patterns live in `src/components/ui`.
- The course flow is controlled from `src/App.tsx`.
- Module 1 includes an embedded PhET neuron simulation as part of the lesson experience.
- External simulations and visual labs are part of the product, not optional extras. They are central to how the course teaches.
- Quiz attempts and evaluation submissions can be persisted through Vercel Functions + Prisma + PostgreSQL.

## Attribution

Attribution links used by the app are recorded in:

- `src/assets/attribute.txt`
