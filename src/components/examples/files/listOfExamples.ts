import elCalcCSVURL from "./elCalcCSV.rls?url";
import elCalcOWLRDFURL from "./elCalcOWLRDF.rls?url";
import oldLimeTreesURL from "./oldLimeTrees.rls?url";
import divByZeroURL from "./div-by-zero.rls?url";
import findCommonAncestors from "./findCommonAncestors.rls?url";

export const listOfExamples: {
  name: string;
  url: string;
}[] = [
  {
    name: "Ancestors (basic)",
    url: findCommonAncestors,
  },
  {
    name: "Old trees",
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
  {
    name: "Div by Zero Analysis (using pregenerated input files for a fixed Java Program)",
    url: divByZeroURL,
  },
];
