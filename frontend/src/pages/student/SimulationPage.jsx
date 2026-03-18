import { useParams } from "react-router-dom";
import { simulationRegistry } from "../../simulations/simulationRegistry";

export default function SimulationPage() {
  const { id } = useParams();

  const SimulationComponent = simulationRegistry[id];

  if (!SimulationComponent) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Simulation not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SimulationComponent />
    </div>
  );
}