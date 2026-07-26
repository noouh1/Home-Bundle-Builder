import { orderedSteps } from '../../data/constants'
import { AccordionStep } from '../AccordionStep/AccordionStep'
import { ReviewPanel } from '../ReviewPanel/ReviewPanel'
import './BuilderColumn.css'

export function BuilderColumn() {
  return (
    <main className="app-shell">
      <div className="layout-shell">
        <section className="builder-shell" aria-label="Security system builder">
          <header className="builder-header">
            <p className="builder-label">Security System Builder</p>
            <h1>Build your bundle</h1>
            <p className="builder-copy">
              Choose your cameras, select a plan, add sensors, and pick accessories — all in one place.
            </p>
          </header>

          <div className="accordion-stack">
            {orderedSteps.map((step, index) => (
              <AccordionStep key={step.id} step={step} index={index} totalSteps={orderedSteps.length} />
            ))}
          </div>
        </section>

        <ReviewPanel />
      </div>
    </main>
  )
}
