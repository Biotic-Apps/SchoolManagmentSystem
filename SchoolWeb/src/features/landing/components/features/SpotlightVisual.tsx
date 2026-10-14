import type { FeatureGroupId } from "./featureGroups";
import { AcademicsVisual, AdminVisual, PeopleVisual } from "./visualsCore";
import { CommunicationVisual, FinanceVisual, OperationsVisual } from "./visualsOps";

/** Decorative mini screen (built from divs) that hints at what the active group looks like in the app. */
export function SpotlightVisual({ id }: { id: FeatureGroupId }) {
  switch (id) {
    case "admin":
      return <AdminVisual />;
    case "people":
      return <PeopleVisual />;
    case "academics":
      return <AcademicsVisual />;
    case "operations":
      return <OperationsVisual />;
    case "finance":
      return <FinanceVisual />;
    case "communication":
      return <CommunicationVisual />;
  }
}
