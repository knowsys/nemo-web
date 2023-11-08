import elCalcCSVURL from "./elCalcCSV.rls?url";
import elCalcOWLRDFURL from "./elCalcOWLRDF.rls?url";
import oldLimeTreesURL from "./oldLimeTrees.rls?url";

export const listOfExamples: {
  name: string;
  url: string;
}[] = [
  {
    name: "Old lime trees",
    url: oldLimeTreesURL,
  },
  {
    name: "OWL EL Reasoning on preprocessed ontologies",
    url: elCalcCSVURL,
  },
  {
    name: "OWL EL Reasoning from OWL/RDF",
    url: elCalcOWLRDFURL,
  },
];
